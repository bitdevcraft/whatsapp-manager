import "dotenv/config";
import WhatsApp from "@workspace/wa-cloud-api";
import { hashPassword } from "better-auth/crypto";
import { and, eq } from "drizzle-orm";

import { db } from "../config";
import { encryptApiKey } from "../crypto";
import { loadBootstrapSeedEnv } from "../env";
import {
  teamMembersTable,
  teamsTable,
  userAccountsTable,
  usersTable,
  type WhatsAppBusinessAccountAccessToken,
  whatsAppBusinessAccountPhoneNumbersTable,
  whatsAppBusinessAccountsTable,
} from "../schema";
import { withTenantTransaction } from "../tenant";

type BootstrapTeam = typeof teamsTable.$inferSelect;
type BootstrapUser = typeof usersTable.$inferSelect;

async function seedBootstrap() {
  const env = loadBootstrapSeedEnv();

  console.log("Seeding bootstrap user...");
  const user = await upsertOwnerUser(env.userEmail, env.userName);
  await upsertCredentialAccount(user.id, env.userPassword);

  console.log("Seeding bootstrap team...");
  const team = await upsertBootstrapTeam({
    metadata: env.teamMetadata,
    name: env.teamName,
    slug: env.teamSlug,
    whatsappLimit: env.teamWhatsAppLimit,
  });
  await upsertOwnerMembership(user.id, team.id, env.teamWhatsAppLimit);

  console.log("Hydrating WhatsApp business data from Meta...");
  const whatsapp = new WhatsApp({
    accessToken: env.whatsappApiAccessToken,
    apiVersion: env.whatsappApiVersion,
    businessAcctId: env.whatsappBusinessAccountId,
    phoneNumberId: Number(env.whatsappPhoneNumberId),
  });

  const [wabaAccount, phoneNumbers] = await Promise.all([
    whatsapp.waba.getWabaAccount(["currency", "id", "name", "owner_business_info"]),
    whatsapp.phoneNumber.getPhoneNumbers(),
  ]);

  const phoneNumber = phoneNumbers.data.find(
    (entry) => entry.id === env.whatsappPhoneNumberId
  );

  if (!phoneNumber) {
    throw new Error(
      `Phone number ${env.whatsappPhoneNumberId} was not found for WhatsApp Business Account ${env.whatsappBusinessAccountId}`
    );
  }

  const accessToken: WhatsAppBusinessAccountAccessToken = {
    ...encryptApiKey(env.whatsappApiAccessToken),
  };

  await withTenantTransaction(team.id, async (tx) => {
    await tx
      .insert(whatsAppBusinessAccountsTable)
      .values({
        accessToken,
        adAccountId: env.adAccountId,
        authResponse: null,
        currency: wabaAccount.currency,
        id: Number(wabaAccount.id ?? env.whatsappBusinessAccountId),
        name: wabaAccount.name,
        ownerBusinessId: wabaAccount.owner_business_info?.id,
        ownerBusinessName: wabaAccount.owner_business_info?.name,
        phoneNumberId: env.whatsappPhoneNumberId,
        teamId: team.id,
        wabaId: env.whatsappBusinessAccountId,
      })
      .onConflictDoUpdate({
        set: {
          accessToken,
          adAccountId: env.adAccountId,
          authResponse: null,
          currency: wabaAccount.currency,
          name: wabaAccount.name,
          ownerBusinessId: wabaAccount.owner_business_info?.id,
          ownerBusinessName: wabaAccount.owner_business_info?.name,
          phoneNumberId: env.whatsappPhoneNumberId,
          teamId: team.id,
          wabaId: env.whatsappBusinessAccountId,
        },
        target: whatsAppBusinessAccountsTable.id,
      });

    await tx
      .insert(whatsAppBusinessAccountPhoneNumbersTable)
      .values({
        accountMode: phoneNumber.account_mode,
        certificate: phoneNumber.certificate,
        codeVerificationStatus: phoneNumber.code_verification_status,
        conversationalAutomation:
          phoneNumber.conversational_automation!,
        displayPhoneNumber: phoneNumber.display_phone_number,
        healthStatus: phoneNumber.health_status,
        id: Number(phoneNumber.id),
        isOfficialBusinessAccount: phoneNumber.is_official_business_account,
        isOnBizApp: phoneNumber.is_on_biz_app,
        isPinEnabled: phoneNumber.is_pin_enabled,
        isPreverifiedNumber: phoneNumber.is_preverified_number,
        lastOnboardTime: phoneNumber.last_onboarded_time,
        messagingLimitTier: phoneNumber.messaging_limit_tier,
        nameStatus: phoneNumber.name_status,
        newCertificate: phoneNumber.new_certificate,
        newNameStatus: phoneNumber.new_name_status,
        platformType: phoneNumber.platform_type,
        qualityRating: phoneNumber.quality_rating,
        qualityScore: phoneNumber.quality_score,
        searchVisibility: phoneNumber.search_visibility,
        status: phoneNumber.status,
        teamId: team.id,
        throughput: phoneNumber.throughput,
        verifiedName: phoneNumber.verified_name,
      })
      .onConflictDoUpdate({
        set: {
          accountMode: phoneNumber.account_mode,
          certificate: phoneNumber.certificate,
          codeVerificationStatus: phoneNumber.code_verification_status,
          conversationalAutomation:
            phoneNumber.conversational_automation!,
          displayPhoneNumber: phoneNumber.display_phone_number,
          healthStatus: phoneNumber.health_status,
          isOfficialBusinessAccount: phoneNumber.is_official_business_account,
          isOnBizApp: phoneNumber.is_on_biz_app,
          isPinEnabled: phoneNumber.is_pin_enabled,
          isPreverifiedNumber: phoneNumber.is_preverified_number,
          lastOnboardTime: phoneNumber.last_onboarded_time,
          messagingLimitTier: phoneNumber.messaging_limit_tier,
          nameStatus: phoneNumber.name_status,
          newCertificate: phoneNumber.new_certificate,
          newNameStatus: phoneNumber.new_name_status,
          platformType: phoneNumber.platform_type,
          qualityRating: phoneNumber.quality_rating,
          qualityScore: phoneNumber.quality_score,
          searchVisibility: phoneNumber.search_visibility,
          status: phoneNumber.status,
          teamId: team.id,
          throughput: phoneNumber.throughput,
          verifiedName: phoneNumber.verified_name,
        },
        target: whatsAppBusinessAccountPhoneNumbersTable.id,
      });
  });

  console.log("Bootstrap seed completed successfully.");
}

async function upsertBootstrapTeam(input: {
  metadata: string;
  name: string;
  slug: string;
  whatsappLimit?: number;
}): Promise<BootstrapTeam> {
  const existingTeams = await db
    .select()
    .from(teamsTable)
    .where(eq(teamsTable.slug, input.slug))
    .limit(2);

  if (existingTeams.length > 1) {
    throw new Error(
      `Multiple teams already exist with slug "${input.slug}". Resolve that before running the bootstrap seed again.`
    );
  }

  if (existingTeams[0]) {
    const [updatedTeam] = await db
      .update(teamsTable)
      .set({
        metadata: input.metadata,
        name: input.name,
        slug: input.slug,
        whatsappLimit: input.whatsappLimit,
      })
      .where(eq(teamsTable.id, existingTeams[0].id))
      .returning();

    return updatedTeam ?? existingTeams[0];
  }

  const [createdTeam] = await db
    .insert(teamsTable)
    .values({
      metadata: input.metadata,
      name: input.name,
      slug: input.slug,
      whatsappLimit: input.whatsappLimit,
    })
    .returning();

  if (!createdTeam) {
    throw new Error("Failed to create bootstrap team");
  }

  return createdTeam;
}

async function upsertCredentialAccount(userId: string, password: string) {
  const hashedPassword = await hashPassword(password);
  const existingAccount = await db.query.userAccountsTable.findFirst({
    where: and(
      eq(userAccountsTable.providerId, "credential"),
      eq(userAccountsTable.userId, userId)
    ),
  });

  if (existingAccount) {
    await db
      .update(userAccountsTable)
      .set({
        accountId: userId,
        password: hashedPassword,
        providerId: "credential",
      })
      .where(eq(userAccountsTable.id, existingAccount.id));

    return;
  }

  await db.insert(userAccountsTable).values({
    accountId: userId,
    password: hashedPassword,
    providerId: "credential",
    userId,
  });
}

async function upsertOwnerMembership(
  userId: string,
  organizationId: string,
  whatsappLimit?: number
) {
  const existingMembership = await db.query.teamMembersTable.findFirst({
    where: and(
      eq(teamMembersTable.organizationId, organizationId),
      eq(teamMembersTable.userId, userId)
    ),
  });

  if (existingMembership) {
    await db
      .update(teamMembersTable)
      .set({
        role: "owner",
        whatsappLimit,
      })
      .where(eq(teamMembersTable.id, existingMembership.id));

    return;
  }

  await db.insert(teamMembersTable).values({
    organizationId,
    role: "owner",
    userId,
    whatsappLimit,
  });
}

async function upsertOwnerUser(email: string, name: string): Promise<BootstrapUser> {
  const existingUser = await db.query.usersTable.findFirst({
    where: eq(usersTable.email, email),
  });

  if (existingUser) {
    const [updatedUser] = await db
      .update(usersTable)
      .set({
        name,
        role: "owner",
      })
      .where(eq(usersTable.id, existingUser.id))
      .returning();

    return updatedUser ?? existingUser;
  }

  const [createdUser] = await db
    .insert(usersTable)
    .values({
      email,
      name,
      role: "owner",
    })
    .returning();

  if (!createdUser) {
    throw new Error("Failed to create bootstrap user");
  }

  return createdUser;
}

seedBootstrap()
  .catch((error) => {
    console.error("Bootstrap seed failed:", error);
    process.exit(1);
  });
