// scripts/seed-contacts.ts
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import { db } from "..";
import { Contact, contactsTable, NewContact } from "@/schema/contacts";

async function seedContacts() {
  // pools for random interests & tags
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

  const contacts: NewContact[] = Array.from({ length: 100 }).map(() => ({
    // baseSchema fields – adjust names if yours differ
    createdAt: faker.date.past({ years: 1 }),
    updatedAt: faker.date.recent({ days: 30 }),

    name: faker.person.fullName(),
    // required fields
    phone: faker.phone.number({ style: "international" }),
    email: faker.internet.email(),
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
  }));

  // insert all 100 rows in one go
  await db.insert(contactsTable).values(contacts);
  console.log(`Inserted ${contacts.length} contacts.`);
}

seedContacts()
  .catch((err) => {
    console.error("Seeding failed:", err);
    process.exit(1);
  })
  .then(() => process.exit(0));
