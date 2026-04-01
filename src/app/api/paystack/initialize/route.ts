import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { paystackInitialize } from "@/lib/paystack";

const bodySchema = z.object({
  slug: z.string().min(1),
  amountNgn: z.number().positive().max(50_000_000),
  customerEmail: z.string().email(),
});

function appUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL || process.env.AUTH_URL;
  if (!url) throw new Error("Set NEXT_PUBLIC_APP_URL (or AUTH_URL) to your public site URL");
  return url.replace(/\/$/, "");
}

export async function POST(req: Request) {
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

  const { slug, amountNgn, customerEmail } = parsed.data;

  const creator = await prisma.creatorProfile.findFirst({
    where: { slug: slug.trim().toLowerCase(), approved: true },
  });

  if (!creator) {
    return NextResponse.json({ error: "Creator not found or not accepting payments" }, { status: 404 });
  }

  const amountKobo = Math.round(amountNgn * 100);
  if (amountKobo < 100_00) {
    return NextResponse.json({ error: "Minimum amount is ₦100" }, { status: 400 });
  }

  const callbackUrl = `${appUrl()}/p/${creator.slug}/complete`;

  const metadata = {
    creator_profile_id: creator.id,
    creator_slug: creator.slug,
    creator_share_percent: creator.creatorSharePercent,
  };

  const payload: Record<string, unknown> = {
    email: customerEmail.trim().toLowerCase(),
    amount: amountKobo,
    currency: "NGN",
    callback_url: callbackUrl,
    metadata,
    channels: ["card", "bank", "ussd", "qr", "mobile_money", "bank_transfer"],
  };

  if (creator.paystackSplitCode) {
    payload.split_code = creator.paystackSplitCode;
  }

  let init: { authorization_url?: string; reference?: string };
  try {
    init = await paystackInitialize(payload);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Payment initialization failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const reference = init.reference;
  if (!reference) {
    return NextResponse.json({ error: "No reference from Paystack" }, { status: 502 });
  }

  const creatorAmountKobo = Math.floor((amountKobo * creator.creatorSharePercent) / 100);
  const platformAmountKobo = amountKobo - creatorAmountKobo;

  await prisma.transaction.create({
    data: {
      paystackReference: reference,
      amountKobo,
      status: "pending",
      creatorSharePercentSnapshot: creator.creatorSharePercent,
      creatorAmountKobo,
      platformAmountKobo,
      customerEmail: customerEmail.trim().toLowerCase(),
      metadata: metadata as object,
      creatorProfileId: creator.id,
    },
  });

  return NextResponse.json({
    authorizationUrl: init.authorization_url,
    reference,
  });
}
