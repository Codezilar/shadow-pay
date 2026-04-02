import { auth } from "@/auth";
import { CreatorDashboard } from "@/components/creator-dashboard";
import { getCreatorFinancialSummary } from "@/lib/creator-finance";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (session.user.role === "ADMIN") {
    redirect("/admin");
  }

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
    include: { user: { select: { email: true, name: true } } },
  });

  if (!profile) {
    return (
      <div className="mx-auto max-w-lg px-4 py-16 text-center">
        <div className="sci-panel rounded-[30px] p-8">
          <p className="text-sm text-slate-300">No creator profile found for this account.</p>
        </div>
      </div>
    );
  }

  const totals = await prisma.transaction.aggregate({
    where: { creatorProfileId: profile.id, status: "success" },
    _sum: { amountKobo: true },
    _count: true,
  });

  const [finance, students, withdrawals] = await Promise.all([
    getCreatorFinancialSummary(profile.id),
    prisma.studentEnrollment.findMany({
      where: { creatorProfileId: profile.id },
      include: { user: true },
      orderBy: { lastPaidAt: "desc" },
    }),
    prisma.withdrawalRequest.findMany({
      where: { creatorProfileId: profile.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    }),
  ]);

  return (
    <CreatorDashboard
      profile={{
        id: profile.id,
        slug: profile.slug,
        displayName: profile.displayName,
        bio: profile.bio,
        approved: profile.approved,
        creatorSharePercent: profile.creatorSharePercent,
        paystackSplitCode: profile.paystackSplitCode,
        paystackSubaccountCode: profile.paystackSubaccountCode,
        courseTitle: profile.courseTitle,
        courseDescription: profile.courseDescription,
        user: profile.user,
      }}
      totalAmountKobo={totals._sum.amountKobo ?? 0}
      successfulCount={totals._count}
      availableBalanceKobo={finance.availableKobo}
      students={students.map((student) => ({
        id: student.id,
        email: student.customerEmail,
        name: student.user.name,
        lastPaidAt: student.lastPaidAt.toISOString(),
        lastReference: student.lastReference,
      }))}
      withdrawals={withdrawals.map((request) => ({
        id: request.id,
        amountKobo: request.amountKobo,
        status: request.status,
        adminNote: request.adminNote,
        createdAt: request.createdAt.toISOString(),
      }))}
    />
  );
}
