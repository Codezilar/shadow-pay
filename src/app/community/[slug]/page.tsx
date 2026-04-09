import Link from "next/link";
import { Role } from "@prisma/client";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
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

  if (!session) {
    redirect(`/login?callbackUrl=${encodeURIComponent(`/community/${slug}${access ? `?access=${access}` : ""}`)}`);
  }

  const creatorProfile = await prisma.creatorProfile.findUnique({
    where: { slug: slug.toLowerCase() },
  });

  if (!creatorProfile) {
    notFound();
  }

  if (!creatorProfile.approved && session.user?.role !== Role.ADMIN) {
    return (
      <div className="mx-auto flex min-h-screen w-full max-w-2xl items-center justify-center px-4">
        <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(8,13,31,0.96)_0%,rgba(5,9,22,0.98)_100%)] p-8 text-center shadow-[0_35px_120px_rgba(2,6,23,0.55)] sm:p-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-amber-300/15 mx-auto">
            <svg className="h-8 w-8 text-amber-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold text-white sm:text-4xl">Course Pending Approval</h1>
          <p className="mt-4 text-base text-slate-400">
            This course is currently under review and will be available soon. Please check back later.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full bg-cyan-500/20 px-6 py-3 text-sm font-semibold text-cyan-100 border border-cyan-300/30 hover:bg-cyan-500/30 transition-colors"
            >
              Return Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
