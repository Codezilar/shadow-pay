import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = (process.env.ADMIN_EMAIL || "admin@example.com").trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD || "changeme-now";
  const existingAdmin = await prisma.user.findUnique({
    where: { email },
    select: { id: true, role: true },
  });

  if (!existingAdmin) {
    const passwordHash = await hash(password, 12);

    await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: "Platform Admin",
        role: "ADMIN",
      },
    });

    console.log(`Admin created: ${email} (change ADMIN_PASSWORD in production)`);
  } else {
    console.log(
      `Admin already exists: ${email}. Leaving existing user unchanged to protect current data.`,
    );
  }

  // Seed a sample creator
  const creatorEmail = "creator@example.com";
  const creatorPassword = "creator123";
  const existingCreator = await prisma.user.findUnique({
    where: { email: creatorEmail },
    select: { id: true },
  });
  let creatorUserId = existingCreator?.id;

  if (!creatorUserId) {
    const creatorPasswordHash = await hash(creatorPassword, 12);
    const creatorUser = await prisma.user.create({
      data: {
        email: creatorEmail,
        passwordHash: creatorPasswordHash,
        name: "Sample Creator",
        role: "CREATOR",
      },
      select: { id: true },
    });

    creatorUserId = creatorUser.id;
    console.log(`Sample creator user created: ${creatorEmail} (password: ${creatorPassword})`);
  } else {
    console.log(
      `Sample creator user already exists: ${creatorEmail}. Leaving existing user unchanged.`,
    );
  }

  const existingProfileForUser = await prisma.creatorProfile.findUnique({
    where: { userId: creatorUserId },
    select: { id: true, slug: true },
  });
  const existingProfileForSlug = await prisma.creatorProfile.findUnique({
    where: { slug: "sample-creator" },
    select: { id: true, userId: true },
  });

  if (existingProfileForUser) {
    console.log(
      `Creator profile already exists for ${creatorEmail} (${existingProfileForUser.slug}). Leaving it unchanged.`,
    );
  } else if (existingProfileForSlug) {
    console.log(
      'Slug "sample-creator" is already in use by another profile. Skipping sample creator profile creation.',
    );
  } else {
    await prisma.creatorProfile.create({
      data: {
        userId: creatorUserId,
        slug: "sample-creator",
        displayName: "Sample Creator",
        bio: "This is a sample creator for testing payments.",
        creatorSharePercent: 20,
        approved: true,
      },
    });

    console.log(`Sample creator profile created for: ${creatorEmail}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
