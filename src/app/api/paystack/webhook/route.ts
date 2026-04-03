import crypto from "node:crypto";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { ensureEnrollmentForReference } from "@/lib/community";
import { notifyPaymentSuccess } from "@/lib/notifications";
import { getPaystackSecretKey } from "@/lib/paystack";

export const runtime = "nodejs";

type PaystackWebhookPayload = {
  event?: string;
  data?: {
    reference?: string;
    status?: string;
    amount?: number;
  };
};

export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-paystack-signature");
  if (!signature) {
    return new NextResponse("missing signature", { status: 400 });
  }

  const hash = crypto.createHmac("sha512", getPaystackSecretKey()).update(raw).digest("hex");
  if (hash !== signature) {
    return new NextResponse("invalid signature", { status: 400 });
  }

  let payload: PaystackWebhookPayload;
  try {
    payload = JSON.parse(raw) as PaystackWebhookPayload;
  } catch {
    return new NextResponse("invalid json", { status: 400 });
  }

  const event = payload.event;
  const reference = payload.data?.reference;
  if (!reference || event !== "charge.success") {
    return NextResponse.json({ received: true });
  }

  const status = payload.data?.status === "success" ? "success" : "failed";

  const transactionBefore = await prisma.transaction.findUnique({
    where: { paystackReference: reference },
    select: { status: true },
  });

  await prisma.transaction.updateMany({
    where: { paystackReference: reference },
    data: { status },
  });

  if (status === "success") {
    const enrollment = await ensureEnrollmentForReference(reference);
    if (transactionBefore?.status !== "success") {
      await notifyPaymentSuccess(reference, enrollment ? `/community/${enrollment.creatorSlug}?access=${enrollment.token}` : null);
    }
  }

  return NextResponse.json({ received: true });
}
