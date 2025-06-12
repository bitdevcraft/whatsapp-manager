import { db } from "@workspace/db/index";
import { stripe } from "../payments/stripe";
import { hashPassword } from "@/lib/auth/session";
import {
  contactsTable,
  NewContact,
  NewTag,
  tagsTable,
  teamMembersTable,
  teamsTable,
  usersTable,
} from "@workspace/db/schema";
import { faker } from "@faker-js/faker";

async function createStripeProducts() {
  console.log("Creating Stripe products and prices...");

  const baseProduct = await stripe.products.create({
    name: "Base",
    description: "Base subscription plan",
  });

  await stripe.prices.create({
    product: baseProduct.id,
    unit_amount: 800, // $8 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  const plusProduct = await stripe.products.create({
    name: "Plus",
    description: "Plus subscription plan",
  });

  await stripe.prices.create({
    product: plusProduct.id,
    unit_amount: 1200, // $12 in cents
    currency: "usd",
    recurring: {
      interval: "month",
      trial_period_days: 7,
    },
  });

  console.log("Stripe products and prices created successfully.");
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

  console.log("Initial user created.");

  const [team] = await db
    .insert(teamsTable)
    .values({
      name: "Test Team",
    })
    .returning();

  await db.insert(teamMembersTable).values({
    teamId: team!.id,
    userId: user!.id,
    role: "owner",
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

  await db.insert(tagsTable).values(tags);

  const contacts: NewContact[] = Array.from({ length: 100 }).map(() => ({
    // baseSchema fields – adjust names if yours differ
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 }),

    name: faker.person.fullName(),
    // required fields
    phone: faker.phone.number({ style: "international" }),
    email: "demo-" + faker.internet.email(),
    message: faker.lorem.sentences(faker.number.int({ min: 1, max: 3 })),

    // JSONB arrays
    interests: faker.helpers.arrayElements(
      interestsPool,
      faker.number.int({ min: 0, max: interestsPool.length })
    ),
    tags: faker.helpers.arrayElements(
      tagsPool,
      faker.number.int({ min: 0, max: tagsPool.length })
    ),

    // boolean & optional FK
    opt_in: faker.datatype.boolean(),
    teamId: team!.id,
  }));

  // insert all 100 rows in one go
  await db.insert(contactsTable).values(contacts);

  await createStripeProducts();
}

seed()
  .catch((error) => {
    console.error("Seed process failed:", error);
    process.exit(1);
  })
  .finally(() => {
    console.log("Seed process finished. Exiting...");
    process.exit(0);
  });
