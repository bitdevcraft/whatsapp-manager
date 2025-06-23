import { Worker } from "bullmq";
import { redisConnection } from "@/lib/redis";
import { ioInstance } from "@/socket";
import { socketRegistry } from "@/socket";
import { WhatsAppEvents } from "@workspace/shared";
import { BulkMessageQueue } from "@/types/bulk-message";
import { waClientRegistry } from "@/instance";

export function setupBulkMessagesWorker() {
  const worker = new Worker<BulkMessageQueue>(
    WhatsAppEvents.ProcessingBulkMessagesOutgoing,
    async (job) => {
      console.log("Processing job:", job.id, job.data);
      // Perform async task here...

      const whatsapp = waClientRegistry.get(job.data.registryId);

      const response = await whatsapp?.messages.template(job.data.template);

      console.log(response);
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
    // const userId = job.data.userId;
    // const socketId = socketRegistry.getSocketId(userId);
    // if (socketId) {
    //   ioInstance.to(socketId).emit("job:completed", {
    //     jobId: job.id,
    //     message: "Job completed successfully",
    //   });
    // }

    console.log("Bulk Message Success");
  });

  worker.on("failed", (job, err) => {
    // const userId = job?.data?.userId;
    // const socketId = socketRegistry.getSocketId(userId);
    // if (socketId) {
    //   ioInstance.to(socketId).emit("job:failed", {
    //     jobId: job?.id,
    //     error: err.message,
    //   });
    // }

    console.log("Bulk Message Failed");
  });
}
