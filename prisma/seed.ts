import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "changeme-now";
  const passwordHash = await hash(password, 12);

  await prisma.user.upsert({
    where: { email },
    create: {
      email,
      passwordHash,
      name: "Platform Admin",
      role: "ADMIN",
    },
    update: {
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin ready: ${email} (change ADMIN_PASSWORD in production)`);

  // Seed a sample creator
  const creatorEmail = "creator@example.com";
  const creatorPassword = "creator123";
  const creatorPasswordHash = await hash(creatorPassword, 12);

  const creatorUser = await prisma.user.upsert({
    where: { email: creatorEmail },
    create: {
      email: creatorEmail,
      passwordHash: creatorPasswordHash,
      name: "Sample Creator",
      role: "CREATOR",
    },
    update: {
      passwordHash: creatorPasswordHash,
      role: "CREATOR",
    },
  });

  await prisma.creatorProfile.upsert({
    where: { userId: creatorUser.id },
    create: {
      userId: creatorUser.id,
      slug: "sample-creator",
      displayName: "Sample Creator",
      bio: "This is a sample creator for testing payments.",
      creatorSharePercent: 70,
      approved: true,
    },
    update: {
      slug: "sample-creator",
      displayName: "Sample Creator",
      bio: "This is a sample creator for testing payments.",
      creatorSharePercent: 70,
      approved: true,
    },
  });

  console.log(`Sample creator ready: ${creatorEmail} (password: ${creatorPassword})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
