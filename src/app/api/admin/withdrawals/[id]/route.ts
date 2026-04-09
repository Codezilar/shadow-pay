import { WithdrawalStatus } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getCreatorFinancialSummary } from "@/lib/creator-finance";
import { prisma } from "@/lib/db";
import { notifyWithdrawalStatusUpdate } from "@/lib/notifications";

const bodySchema = z.object({
  status: z.nativeEnum(WithdrawalStatus),
  adminNote: z.string().max(1000).optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { id } = await ctx.params;
  const nextAdminNote = parsed.data.adminNote ?? "";
  const existing = await prisma.withdrawalRequest.findUnique({ where: { id } });
  if (!existing) {
    return NextResponse.json({ error: "Withdrawal request not found" }, { status: 404 });
  }

  const hasChanges = existing.status !== parsed.data.status || existing.adminNote !== nextAdminNote;

  const updated = hasChanges
    ? await prisma.withdrawalRequest.update({
        where: { id },
        data: {
          status: parsed.data.status,
          adminNote: nextAdminNote,
          processedAt: parsed.data.status === WithdrawalStatus.COMPLETED ? new Date() : null,
        },
      })
    : existing;

  const finance = await getCreatorFinancialSummary(updated.creatorProfileId);

  if (hasChanges) {
    await notifyWithdrawalStatusUpdate(updated.id);
  }

  return NextResponse.json({
    request: {
      ...updated,
      creator: {
        availableKobo: finance.availableKobo,
        balanceKobo: finance.balanceKobo,
        pendingReservedKobo: finance.pendingReservedKobo,
      },
    },
  });
}
