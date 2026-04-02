import { auth } from "@/auth";
import { AdminSectionNav } from "@/components/admin-section-nav";
import { AdminWithdrawalsPanel } from "@/components/admin-withdrawals-panel";
import { getCreatorFinancialSummary } from "@/lib/creator-finance";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";

export default async function AdminWithdrawalsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const requests = await prisma.withdrawalRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      creatorProfile: {
        include: {
          user: { select: { email: true, name: true } },
        },
      },
    },
  });

  const creatorFinanceEntries = await Promise.all(
    requests.map(async (request) => [request.creatorProfileId, await getCreatorFinancialSummary(request.creatorProfileId)] as const)
  );
  const financeMap = new Map(creatorFinanceEntries);

  return (
    <div className="space-y-4">
      <AdminSectionNav />
      <AdminWithdrawalsPanel
        withdrawals={requests.map((request) => {
          const finance = financeMap.get(request.creatorProfileId);
          return {
            id: request.id,
            amountKobo: request.amountKobo,
            status: request.status,
            adminNote: request.adminNote,
            createdAt: request.createdAt.toISOString(),
            processedAt: request.processedAt?.toISOString() ?? null,
            creator: {
              id: request.creatorProfile.id,
              slug: request.creatorProfile.slug,
              displayName: request.creatorProfile.displayName || request.creatorProfile.user.name || request.creatorProfile.user.email,
              email: request.creatorProfile.user.email,
              availableKobo: finance?.availableKobo ?? 0,
              balanceKobo: finance?.balanceKobo ?? 0,
              pendingReservedKobo: finance?.pendingReservedKobo ?? 0,
            },
          };
        })}
      />
    </div>
  );
}
