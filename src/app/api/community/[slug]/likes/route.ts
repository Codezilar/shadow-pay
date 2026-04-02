import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { resolveCommunityAccess } from "@/lib/community";
import { prisma } from "@/lib/db";

const bodySchema = z.object({
  accessToken: z.string().optional(),
  targetType: z.enum(["message", "comment"]),
  targetId: z.string().min(1),
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

  if (parsed.data.targetType === "message") {
    const message = await prisma.communityMessage.findFirst({
      where: { id: parsed.data.targetId, creatorProfileId: access.creatorProfile.id },
    });
    if (!message) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const existing = await prisma.communityMessageLike.findUnique({
      where: {
        messageId_userId: {
          messageId: parsed.data.targetId,
          userId: access.viewer.userId,
        },
      },
    });

    if (existing) {
      await prisma.communityMessageLike.delete({ where: { id: existing.id } });
    } else {
      await prisma.communityMessageLike.create({
        data: {
          messageId: parsed.data.targetId,
          userId: access.viewer.userId,
        },
      });
    }

    const likesCount = await prisma.communityMessageLike.count({
      where: { messageId: parsed.data.targetId },
    });

    return NextResponse.json({ liked: !existing, likesCount });
  }

  const comment = await prisma.communityComment.findFirst({
    where: { id: parsed.data.targetId, creatorProfileId: access.creatorProfile.id },
  });
  if (!comment) {
    return NextResponse.json({ error: "Comment not found" }, { status: 404 });
  }

  const existing = await prisma.communityCommentLike.findUnique({
    where: {
      commentId_userId: {
        commentId: parsed.data.targetId,
        userId: access.viewer.userId,
      },
    },
  });

  if (existing) {
    await prisma.communityCommentLike.delete({ where: { id: existing.id } });
  } else {
    await prisma.communityCommentLike.create({
      data: {
        commentId: parsed.data.targetId,
        userId: access.viewer.userId,
      },
    });
  }

  const likesCount = await prisma.communityCommentLike.count({
    where: { commentId: parsed.data.targetId },
  });

  return NextResponse.json({ liked: !existing, likesCount });
}
