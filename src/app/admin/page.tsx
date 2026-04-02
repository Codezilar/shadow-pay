import { auth } from "@/auth";
import { AdminCreatorsPanel } from "@/components/admin-creators-panel";
import { AdminSectionNav } from "@/components/admin-section-nav";
import { getCreatorFinancialSummary } from "@/lib/creator-finance";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const creators = await prisma.creatorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true, name: true } } },
  });

  const successful = await prisma.transaction.aggregate({
    where: { status: "success" },
    _sum: {
      amountKobo: true,
      creatorAmountKobo: true,
      platformAmountKobo: true,
    },
    _count: true,
  });

  const [enrollmentCounts, withdrawalRequests] = await Promise.all([
    prisma.studentEnrollment.groupBy({
      by: ["creatorProfileId"],
      _count: true,
    }),
    prisma.withdrawalRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
    }),
  ]);

  const finances = await Promise.all(creators.map((creator) => getCreatorFinancialSummary(creator.id)));
  const enrollmentCountMap = new Map(enrollmentCounts.map((entry) => [entry.creatorProfileId, entry._count]));

  return (
    <div className="space-y-4">
      <AdminSectionNav />
      <AdminCreatorsPanel
        stats={{
          totalCreators: creators.length,
          approvedCreators: creators.filter((c) => c.approved).length,
          successfulTransactions: successful._count,
          grossKobo: successful._sum.amountKobo ?? 0,
          creatorPayoutKobo: successful._sum.creatorAmountKobo ?? 0,
          platformRevenueKobo: successful._sum.platformAmountKobo ?? 0,
        }}
        creators={creators.map((c, index) => ({
          id: c.id,
          slug: c.slug,
          displayName: c.displayName,
          bio: c.bio,
          approved: c.approved,
          creatorSharePercent: c.creatorSharePercent,
          paystackSplitCode: c.paystackSplitCode,
          paystackSubaccountCode: c.paystackSubaccountCode,
          paymentAmounts: JSON.parse(c.paymentAmountsJson || "[]"),
          courseTitle: c.courseTitle,
          courseDescription: c.courseDescription,
          user: { email: c.user.email, name: c.user.name },
          studentCount: enrollmentCountMap.get(c.id) ?? 0,
          availableBalanceKobo: finances[index]?.availableKobo ?? 0,
          withdrawals: withdrawalRequests
            .filter((request) => request.creatorProfileId === c.id)
            .map((request) => ({
              id: request.id,
              amountKobo: request.amountKobo,
              status: request.status,
              adminNote: request.adminNote,
              createdAt: request.createdAt.toISOString(),
            })),
        }))}
      />
    </div>
  );
}
