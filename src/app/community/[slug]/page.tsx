import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { CourseCommunity } from "@/components/course-community";
import { resolveCommunityAccess } from "@/lib/community";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ access?: string }>;
};

export default async function CommunityPage({ params, searchParams }: Props) {
  const [{ slug }, { access }] = await Promise.all([params, searchParams]);
  const session = await auth();

  const accessResult = await resolveCommunityAccess({
    slug,
    accessToken: access,
    userId: session?.user?.id,
    userRole: session?.user?.role as Role | undefined,
  });

  if (!accessResult) {
    notFound();
  }

  const [members, messages] = await Promise.all([
    prisma.studentEnrollment.findMany({
      where: { creatorProfileId: accessResult.creatorProfile.id },
      include: { user: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.communityMessage.findMany({
      where: { creatorProfileId: accessResult.creatorProfile.id },
      orderBy: { createdAt: "asc" },
      take: 200,
      include: {
        likes: true,
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: "asc" },
          include: {
            likes: true,
            replies: {
              orderBy: { createdAt: "asc" },
              include: {
                likes: true,
              },
            },
          },
        },
      },
    }),
  ]);

  return (
    <CourseCommunity
      slug={slug}
      title={accessResult.creatorProfile.courseTitle || accessResult.creatorProfile.displayName}
      description={accessResult.creatorProfile.courseDescription || accessResult.creatorProfile.bio}
      accessToken={access}
      canPost={accessResult.viewer.role === Role.CREATOR || accessResult.viewer.role === Role.ADMIN}
      currentUserId={accessResult.viewer.userId}
      members={members.map((member) => ({
        id: member.id,
        name: member.user.name,
        email: member.customerEmail,
        joinedAt: member.createdAt.toISOString(),
      }))}
      initialMessages={messages.map((message) => ({
        id: message.id,
        authorUserId: message.authorUserId,
        authorName: message.authorName,
        authorRole: message.authorRole,
        body: message.body,
        createdAt: message.createdAt.toISOString(),
        likesCount: message.likes.length,
        viewerHasLiked: message.likes.some((like) => like.userId === accessResult.viewer.userId),
        comments: message.comments.map((comment) => ({
          id: comment.id,
          parentId: comment.parentId,
          authorUserId: comment.authorUserId,
          authorName: comment.authorName,
          authorRole: comment.authorRole,
          body: comment.body,
          createdAt: comment.createdAt.toISOString(),
          likesCount: comment.likes.length,
          viewerHasLiked: comment.likes.some((like) => like.userId === accessResult.viewer.userId),
          replies: comment.replies.map((reply) => ({
            id: reply.id,
            parentId: reply.parentId,
            authorUserId: reply.authorUserId,
            authorName: reply.authorName,
            authorRole: reply.authorRole,
            body: reply.body,
            createdAt: reply.createdAt.toISOString(),
            likesCount: reply.likes.length,
            viewerHasLiked: reply.likes.some((like) => like.userId === accessResult.viewer.userId),
            replies: [],
          })),
        })),
      }))}
    />
  );
}
