import { auth } from "@/auth";
import { AdminCommunitiesPanel } from "@/components/admin-communities-panel";
import { AdminSectionNav } from "@/components/admin-section-nav";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminCommunitiesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const creators = await prisma.creatorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { email: true, name: true } },
      studentEnrollments: { select: { id: true } },
      communityMessages: {
        select: { id: true, createdAt: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  return (
    <div className="space-y-4">
      <AdminSectionNav />
      <AdminCommunitiesPanel
        communities={creators.map((creator) => ({
          id: creator.id,
          slug: creator.slug,
          displayName: creator.displayName,
          courseTitle: creator.courseTitle,
          courseDescription: creator.courseDescription,
          approved: creator.approved,
          memberCount: creator.studentEnrollments.length,
          messageCount: creator.communityMessages.length,
          latestMessageAt: creator.communityMessages[0]?.createdAt.toISOString() ?? null,
          user: creator.user,
        }))}
      />
    </div>
  );
}
