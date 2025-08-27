import { faker } from "@faker-js/faker";
import { db } from "@workspace/db/config";
import {
  contactsTable,
  NewContact,
  NewTag,
  tagsTable,
  teamMembersTable,
  teamsTable,
  usersTable,
} from "@workspace/db/schema";
import { withTenantTransaction } from "@workspace/db/tenant";

import { hashPassword } from "@/lib/auth/session";
import { logger } from "@/lib/logger";

import { stripe } from "../payments/stripe";

async function createStripeProducts() {
  logger.log("Creating Stripe products and prices...");

  const baseProduct = await stripe.products.create({
    description: "Starter subscription plan",
    name: "Starter",
  });

  await stripe.prices.create({
    currency: "usd",
    metadata: {
      limit: 1000,
    },
    product: baseProduct.id,
    recurring: {
      interval: "month",
      trial_period_days: 0,
    },
    unit_amount: 800, // $8 in cents
  });

  const plusProduct = await stripe.products.create({
    description: "Plus subscription plan",
    name: "Plus",
  });

  await stripe.prices.create({
    currency: "usd",
    metadata: {
      limit: 10000,
    },
    product: plusProduct.id,
    recurring: {
      interval: "month",
      trial_period_days: 0,
    },
    unit_amount: 1200, // $12 in cents
  });

  logger.log("Stripe products and prices created successfully.");
}

async function seed() {
  const email = "test@test.com";
  const password = "admin123";
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(usersTable)
    .values([
      {
        email: email,
        passwordHash: passwordHash,
        role: "owner",
      },
    ])
    .returning();

  logger.log("Initial user created.");

  const [team] = await db
    .insert(teamsTable)
    .values({
      name: "Test Team",
    })
    .returning();

  await db.insert(teamMembersTable).values({
    organizationId: team!.id,
    role: "owner",
    userId: user!.id,
  });

  const interestsPool = [
    "sports",
    "music",
    "travel",
    "reading",
    "coding",
    "photography",
    "art",
  ];

  const tagsPool = [
    "new",
    "vip",
    "prospect",
    "newsletter",
    "follow-up",
    "important",
  ];

  const tags: NewTag[] = tagsPool.map((tag) => ({
    name: tag,
    teamId: team!.id,
  }));

  const contacts: NewContact[] = Array.from({ length: 100 }).map(() => ({
    // baseSchema fields – adjust names if yours differ
    createdAt: faker.date.past({ years: 1 }),
    email: "demo-" + faker.internet.email(),

    // JSONB arrays
    interests: faker.helpers.arrayElements(
      interestsPool,
      faker.number.int({ max: interestsPool.length, min: 0 })
    ),
    message: faker.lorem.sentences(faker.number.int({ max: 3, min: 1 })),
    name: faker.person.fullName(),
    // boolean & optional FK
    opt_in: faker.datatype.boolean(),

    // required fields
    phone: faker.phone.number({ style: "international" }),
    tags: faker.helpers.arrayElements(
      tagsPool,
      faker.number.int({ max: tagsPool.length, min: 0 })
    ),

    teamId: team!.id,
    updatedAt: faker.date.recent({ days: 30 }),
  }));

  await withTenantTransaction(team!.id, async (tx) => {
    await tx.insert(tagsTable).values(tags);

    // insert all 100 rows in one go
    await tx.insert(contactsTable).values(contacts);
  });

  await createStripeProducts();
}

seed()
  .catch((error) => {
    logger.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    logger.log("Seed process finished. Exiting...");
    process.exit(0);
  });
