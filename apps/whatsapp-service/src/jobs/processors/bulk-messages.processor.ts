import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";
import { NotificationEvent, WhatsAppEvents } from "@workspace/shared";
import { BulkMessageQueue } from "@/types/bulk-message";
import { waClientRegistry } from "@/instance";
import {
  contactsTable,
  conversationsTable,
  NewContact,
  NewConversation,
  withTenantTransaction,
} from "@workspace/db";
import { and, eq } from "drizzle-orm";

import { MessageStatus } from "@workspace/wa-cloud-api/core/webhook";

export function setupBulkMessagesWorker() {
  const worker = new Worker<BulkMessageQueue>(
    WhatsAppEvents.ProcessingBulkMessagesOutgoing,
    async (job) => {
      console.log("Processing job:", job.id, job.data);
      // Perform async task here...

      try {
        const whatsapp = waClientRegistry.get(job.data.registryId);

        const response = await whatsapp?.messages.template(job.data.template);

        console.log(response);

        const isSuccess = !!response?.messages[0]?.id;

        await withTenantTransaction(job.data.teamId, async (tx) => {
          let contactId = "";

          const contact = await tx.query.contactsTable.findFirst({
            where: and(
              eq(contactsTable.normalizedPhone, response?.contacts[0]?.input!),
              eq(contactsTable.teamId, job.data.teamId)
            ),
          });

          contactId = contact?.id ?? "";

          if (!contact) {
            const insertContact: NewContact = {
              name: "",
              phone: response?.contacts[0].input!,
              teamId: job.data.teamId,
              email: "",
              message: "",
            };
            const temp = await tx
              .insert(contactsTable)
              .values(insertContact)
              .returning();

            if (temp[0]) {
              contactId = temp[0].id;
            }
          }

          const conversation: NewConversation = {
            teamId: job.data.teamId,
            content: job.data.template,
            wamid: response?.messages[0]?.id,
            status: isSuccess ? MessageStatus.DELIVERED : null,
            isMarketingCampaign: true,
            success: isSuccess,
            contactId: contactId,
            marketingCampaignId: job.data.marketingCampaignId,
          };

          return await tx
            .insert(conversationsTable)
            .values(conversation)
            .returning();
        });
      } catch (error) {
        console.error(error);
        throw Error("");
      }
    },
    {
      connection: redisConnection,
      concurrency: 50,
      limiter: {
        max: 100,
        duration: 60_000,
      },
    }
  );

  worker.on("completed", (job) => {
    const { teamId, marketingCampaignId } = job.data;

    ioInstance
      .to(`team:${teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        jobId: job.id,
        payload: {
          message: "Campaign Processed",
          data: {},
        },
        teamId,
        relatedId: marketingCampaignId,
      });

    console.log("Bulk Message Success");
  });

  worker.on("failed", (job, err) => {
    if (!job) return;
    const { teamId, marketingCampaignId } = job.data;

    ioInstance
      .to(`team:${teamId}`)
      .emit(NotificationEvent.WhatsAppBulkMessageOutgoingSuccess, {
        jobId: job.id!, // if `job.id` is possibly undefined, make sure it's not
        payload: {
          message: "Campaign Failed",
        },
        teamId,
        error: err,
        relatedId: marketingCampaignId,
      });

    console.log("Bulk Message Failed");
  });

  return worker;
}

async function insertConversation(
  conversation: NewConversation,
  teamId: string
) {
  await withTenantTransaction(teamId, async (tx) => {
    return await tx.insert(conversationsTable).values(conversation).returning();
  });
}
