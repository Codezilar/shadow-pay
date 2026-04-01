import { auth } from "@/auth";
import { CreatorDashboard } from "@/components/creator-dashboard";
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
        <p className="text-sm text-zinc-600 dark:text-zinc-400">No creator profile found for this account.</p>
      </div>
    );
  }

  const totals = await prisma.transaction.aggregate({
    where: { creatorProfileId: profile.id, status: "success" },
    _sum: { amountKobo: true },
    _count: true,
  });

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
        user: profile.user,
      }}
      totalAmountKobo={totals._sum.amountKobo ?? 0}
      successfulCount={totals._count}
    />
  );
}
