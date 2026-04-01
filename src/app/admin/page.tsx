import { auth } from "@/auth";
import { AdminCreatorsPanel } from "@/components/admin-creators-panel";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const creators = await prisma.creatorProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { email: true } } },
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

  return (
    <AdminCreatorsPanel
      stats={{
        totalCreators: creators.length,
        approvedCreators: creators.filter((c) => c.approved).length,
        successfulTransactions: successful._count,
        grossKobo: successful._sum.amountKobo ?? 0,
        creatorPayoutKobo: successful._sum.creatorAmountKobo ?? 0,
        platformRevenueKobo: successful._sum.platformAmountKobo ?? 0,
      }}
      creators={creators.map((c) => ({
        id: c.id,
        slug: c.slug,
        displayName: c.displayName,
        bio: c.bio,
        approved: c.approved,
        creatorSharePercent: c.creatorSharePercent,
        paystackSplitCode: c.paystackSplitCode,
        paystackSubaccountCode: c.paystackSubaccountCode,
        paymentAmounts: JSON.parse(c.paymentAmountsJson || "[]"),
        user: { email: c.user.email },
      }))}
    />
  );
}
