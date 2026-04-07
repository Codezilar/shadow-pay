import { auth } from "@/auth";
import { AdminCreatorsPanel } from "@/components/admin-creators-panel";
import { AdminSectionNav } from "@/components/admin-section-nav";
import { getCreatorFinancialSummary } from "@/lib/creator-finance";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

function parsePaymentAmountsJson(value: string | null | undefined) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((entry) => typeof entry === "number") : [];
  } catch {
    return [];
  }
}

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  let adminData:
    | {
        creators: Awaited<ReturnType<typeof prisma.creatorProfile.findMany>>;
        successful: Awaited<ReturnType<typeof prisma.transaction.aggregate>>;
        enrollmentCounts: Awaited<ReturnType<typeof prisma.studentEnrollment.groupBy>>;
        withdrawalRequests: Awaited<ReturnType<typeof prisma.withdrawalRequest.findMany>>;
        finances: Awaited<ReturnType<typeof getCreatorFinancialSummary>>[];
      }
    | null = null;

  try {
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
    adminData = { creators, successful, enrollmentCounts, withdrawalRequests, finances };
  } catch (error) {
    console.error("Admin page failed to load", error);
  }

  if (!adminData) {
    return (
      <div className="space-y-4">
        <AdminSectionNav />
        <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6 lg:px-8">
          <div className="rounded-[28px] border border-amber-400/25 bg-amber-400/10 p-6 text-sm text-amber-100">
            <p className="font-semibold uppercase tracking-[0.2em]">Admin data unavailable</p>
            <p className="mt-3 leading-6 text-amber-50/90">
              The admin session is valid, but the server could not read the admin data. In production this usually
              means the database schema is behind the current code or one of the stored creator settings contains
              invalid JSON.
            </p>
            <p className="mt-3 leading-6 text-amber-50/90">
              Check the Vercel function logs for this request and make sure the production database has been updated
              to match the current Prisma schema before retrying.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const enrollmentCountMap = new Map(adminData.enrollmentCounts.map((entry) => [entry.creatorProfileId, entry._count]));

  return (
    <div className="space-y-4">
      <AdminSectionNav />
      <AdminCreatorsPanel
        stats={{
          totalCreators: adminData.creators.length,
          approvedCreators: adminData.creators.filter((c) => c.approved).length,
          successfulTransactions: adminData.successful._count,
          grossKobo: adminData.successful._sum.amountKobo ?? 0,
          creatorPayoutKobo: adminData.successful._sum.creatorAmountKobo ?? 0,
          platformRevenueKobo: adminData.successful._sum.platformAmountKobo ?? 0,
        }}
        creators={adminData.creators.map((c, index) => ({
          id: c.id,
          slug: c.slug,
          displayName: c.displayName,
          bio: c.bio,
          approved: c.approved,
          creatorSharePercent: c.creatorSharePercent,
          paystackSplitCode: c.paystackSplitCode,
          paystackSubaccountCode: c.paystackSubaccountCode,
          paymentAmounts: parsePaymentAmountsJson(c.paymentAmountsJson),
          courseTitle: c.courseTitle,
          courseDescription: c.courseDescription,
          user: { email: c.user.email, name: c.user.name },
          studentCount: enrollmentCountMap.get(c.id) ?? 0,
          availableBalanceKobo: adminData.finances[index]?.availableKobo ?? 0,
          withdrawals: adminData.withdrawalRequests
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
