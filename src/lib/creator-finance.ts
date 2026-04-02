import { WithdrawalStatus } from "@prisma/client";
import { prisma } from "@/lib/db";

export async function getCreatorFinancialSummary(creatorProfileId: string) {
  const [successTotals, completedTotals, pendingTotals] = await Promise.all([
    prisma.transaction.aggregate({
      where: {
        creatorProfileId,
        status: "success",
      },
      _sum: {
        creatorAmountKobo: true,
      },
    }),
    prisma.withdrawalRequest.aggregate({
      where: {
        creatorProfileId,
        status: WithdrawalStatus.COMPLETED,
      },
      _sum: {
        amountKobo: true,
      },
    }),
    prisma.withdrawalRequest.aggregate({
      where: {
        creatorProfileId,
        status: {
          in: [WithdrawalStatus.PENDING, WithdrawalStatus.PROCESSING],
        },
      },
      _sum: {
        amountKobo: true,
      },
    }),
  ]);

  const earnedKobo = successTotals._sum.creatorAmountKobo ?? 0;
  const completedWithdrawnKobo = completedTotals._sum.amountKobo ?? 0;
  const pendingReservedKobo = pendingTotals._sum.amountKobo ?? 0;
  const balanceKobo = Math.max(0, earnedKobo - completedWithdrawnKobo);
  const availableKobo = Math.max(0, balanceKobo - pendingReservedKobo);

  return {
    earnedKobo,
    balanceKobo,
    completedWithdrawnKobo,
    pendingReservedKobo,
    availableKobo,
  };
}
