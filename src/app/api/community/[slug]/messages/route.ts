import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { resolveCommunityAccess } from "@/lib/community";
import { prisma } from "@/lib/db";
import { notifyCreatorPost } from "@/lib/notifications";

const bodySchema = z.object({
  body: z.string().min(1).max(2000),
  accessToken: z.string().optional(),
});

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const session = await auth();
  const accessToken = new URL(req.url).searchParams.get("access");
  const access = await resolveCommunityAccess({
    slug,
    accessToken,
    userId: session?.user?.id,
    userRole: session?.user?.role as Role | undefined,
  });

  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const messages = await prisma.communityMessage.findMany({
    where: { creatorProfileId: access.creatorProfile.id },
    orderBy: { createdAt: "asc" },
    take: 200,
    include: {
      likes: true,
      comments: {
        include: {
          likes: true,
          replies: {
            include: {
              likes: true,
            },
            orderBy: { createdAt: "asc" },
          },
        },
        where: { parentId: null },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({ messages });
}

export async function POST(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const session = await auth();

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const access = await resolveCommunityAccess({
    slug,
    accessToken: parsed.data.accessToken,
    userId: session?.user?.id,
    userRole: session?.user?.role as Role | undefined,
  });

  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (access.viewer.role !== Role.CREATOR && access.viewer.role !== Role.ADMIN) {
    return NextResponse.json({ error: "Only creators and admins can create posts" }, { status: 403 });
  }

  const message = await prisma.communityMessage.create({
    data: {
      creatorProfileId: access.creatorProfile.id,
      authorUserId: access.viewer.userId,
      authorEnrollmentId: access.membership?.id ?? null,
      authorName: access.viewer.authorName,
      authorRole: access.viewer.role,
      body: parsed.data.body.trim(),
    },
  });

  if (message.authorRole === Role.CREATOR) {
    await notifyCreatorPost(message.id);
  }

  return NextResponse.json({ message });
}
