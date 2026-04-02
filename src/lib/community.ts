import { hash } from "bcryptjs";
import crypto from "node:crypto";
import { Role } from "@prisma/client";
import { prisma } from "@/lib/db";

function randomSecret(length = 24) {
  return crypto.randomBytes(length).toString("hex");
}

export async function ensureEnrollmentForReference(reference: string) {
  const transaction = await prisma.transaction.findUnique({
    where: { paystackReference: reference },
    include: { creatorProfile: true },
  });

  if (!transaction || transaction.status !== "success" || !transaction.customerEmail) {
    return null;
  }

  const email = transaction.customerEmail.trim().toLowerCase();

  let user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash: await hash(randomSecret(), 12),
        name: email.split("@")[0],
        role: Role.STUDENT,
      },
    });
  }

  const enrollment = await prisma.studentEnrollment.upsert({
    where: {
      userId_creatorProfileId: {
        userId: user.id,
        creatorProfileId: transaction.creatorProfileId,
      },
    },
    create: {
      userId: user.id,
      creatorProfileId: transaction.creatorProfileId,
      customerEmail: email,
      lastReference: transaction.paystackReference,
      lastPaidAt: transaction.updatedAt,
    },
    update: {
      customerEmail: email,
      lastReference: transaction.paystackReference,
      lastPaidAt: transaction.updatedAt,
    },
  });

  const token = randomSecret(18);
  await prisma.communityAccessToken.create({
    data: {
      token,
      enrollmentId: enrollment.id,
      expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
    },
  });

  return {
    creatorSlug: transaction.creatorProfile.slug,
    token,
    enrollmentId: enrollment.id,
    userId: user.id,
  };
}

export async function resolveCommunityAccess({
  slug,
  accessToken,
  userId,
  userRole,
}: {
  slug: string;
  accessToken?: string | null;
  userId?: string;
  userRole?: Role;
}) {
  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { slug: slug.toLowerCase() },
    include: { user: true },
  });

  if (!creatorProfile) {
    return null;
  }

  if (userId && userRole === Role.ADMIN) {
    const adminUser = await prisma.user.findUnique({ where: { id: userId } });
    return {
      creatorProfile,
      membership: null,
      viewer: {
        userId,
        role: Role.ADMIN,
        authorName: adminUser?.name?.trim() || adminUser?.email || "Platform Admin",
      },
    };
  }

  if (userId && userRole === Role.CREATOR && creatorProfile.userId === userId) {
    return {
      creatorProfile,
      membership: null,
      viewer: {
        userId,
        role: Role.CREATOR,
        authorName: creatorProfile.displayName,
      },
    };
  }

  if (!accessToken) {
    return null;
  }

  const token = await prisma.communityAccessToken.findUnique({
    where: { token: accessToken },
    include: {
      enrollment: {
        include: {
          user: true,
          creatorProfile: true,
        },
      },
    },
  });

  if (!token || token.enrollment.creatorProfile.slug !== slug.toLowerCase()) {
    return null;
  }

  if (token.expiresAt && token.expiresAt < new Date()) {
    return null;
  }

  return {
    creatorProfile,
    membership: token.enrollment,
    viewer: {
      userId: token.enrollment.userId,
      role: token.enrollment.user.role,
      authorName: token.enrollment.user.name?.trim() || token.enrollment.customerEmail,
    },
  };
}
