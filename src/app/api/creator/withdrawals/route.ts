import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getCreatorFinancialSummary } from "@/lib/creator-finance";
import { prisma } from "@/lib/db";
import { notifyWithdrawalRequest } from "@/lib/notifications";

const bodySchema = z.object({
  amountNgn: z.number().positive(),
});

const minimumWithdrawalKobo = 10_000 * 100;

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user || session.user.role !== "CREATOR") {
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

  const profile = await prisma.creatorProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!profile) {
    return NextResponse.json({ error: "Creator profile not found" }, { status: 404 });
  }

  const amountKobo = Math.round(parsed.data.amountNgn * 100);
  if (amountKobo < minimumWithdrawalKobo) {
    return NextResponse.json({ error: "Minimum withdrawal is NGN 10,000" }, { status: 400 });
  }

  const finance = await getCreatorFinancialSummary(profile.id);
  if (finance.availableKobo < minimumWithdrawalKobo) {
    return NextResponse.json({ error: "Available balance must be at least NGN 10,000" }, { status: 400 });
  }
  if (amountKobo > finance.availableKobo) {
    return NextResponse.json({ error: "Withdrawal amount exceeds available balance" }, { status: 400 });
  }

  const requestRecord = await prisma.withdrawalRequest.create({
    data: {
      creatorProfileId: profile.id,
      amountKobo,
    },
  });

  await notifyWithdrawalRequest(requestRecord.id);

  return NextResponse.json({ request: requestRecord });
}
