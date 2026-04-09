import { auth } from "@/auth";
import Link from "next/link";
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

  if (session.user.role === "STUDENT") {
    const enrollments = await prisma.studentEnrollment.findMany({
      where: { userId: session.user.id },
      include: { creatorProfile: true },
      orderBy: { lastPaidAt: "desc" },
    });

    if (enrollments.length === 1) {
      redirect(`/community/${enrollments[0].creatorProfile.slug}`);
    }

    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <div className="sci-panel rounded-[30px] p-8">
          <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Student Access</p>
          <h1 className="mt-3 text-2xl font-semibold tracking-[0.05em] text-white">Your communities</h1>
          <p className="mt-2 text-sm text-slate-400">
            You can only open communities connected to courses you&apos;ve successfully paid for.
          </p>
          <div className="mt-6 space-y-3">
            {enrollments.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
                No paid course communities are linked to this account yet.
              </div>
            ) : (
              enrollments.map((enrollment) => (
                <Link
                  key={enrollment.id}
                  href={`/community/${enrollment.creatorProfile.slug}`}
                  className="block rounded-2xl border border-white/10 bg-white/5 px-4 py-4 transition hover:border-cyan-300/35 hover:bg-cyan-300/10"
                >
                  <p className="text-sm font-semibold text-white">
                    {enrollment.creatorProfile.courseTitle || enrollment.creatorProfile.displayName}
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Joined {new Intl.DateTimeFormat("en-NG", { dateStyle: "medium" }).format(enrollment.createdAt)}
                  </p>
                </Link>
              ))
            )}
          </div>
        </div>
      </div>
    );
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
