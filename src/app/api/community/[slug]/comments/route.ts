import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { resolveCommunityAccess } from "@/lib/community";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  accessToken: z.string().optional(),
  messageId: z.string().min(1),
  parentCommentId: z.string().min(1).optional(),
  body: z.string().min(1).max(2000),
});

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

  const message = await prisma.communityMessage.findFirst({
    where: {
      id: parsed.data.messageId,
      creatorProfileId: access.creatorProfile.id,
    },
  });

  if (!message) {
    return NextResponse.json({ error: "Post not found" }, { status: 404 });
  }

  if (parsed.data.parentCommentId) {
    const parent = await prisma.communityComment.findFirst({
      where: {
        id: parsed.data.parentCommentId,
        messageId: parsed.data.messageId,
        creatorProfileId: access.creatorProfile.id,
      },
    });
    if (!parent) {
      return NextResponse.json({ error: "Parent comment not found" }, { status: 404 });
    }
  }

  const comment = await prisma.communityComment.create({
    data: {
      creatorProfileId: access.creatorProfile.id,
      messageId: parsed.data.messageId,
      parentId: parsed.data.parentCommentId ?? null,
      authorUserId: access.viewer.userId,
      authorEnrollmentId: access.membership?.id ?? null,
      authorName: access.viewer.authorName,
      authorRole: access.viewer.role,
      body: parsed.data.body.trim(),
    },
    include: {
      likes: true,
    },
  });

  return NextResponse.json({ comment });
}
