import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { paystackVerify } from "@/lib/paystack";

export async function GET(req: Request) {
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Missing reference" }, { status: 400 });
  }

  let data: Awaited<ReturnType<typeof paystackVerify>>;
  try {
    data = await paystackVerify(reference);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Verify failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }

  const ok = data.status === "success";
  await prisma.transaction.updateMany({
    where: { paystackReference: reference },
    data: { status: ok ? "success" : "failed" },
  });

  return NextResponse.json({
    ok,
    amountKobo: data.amount,
    currency: data.currency,
    customerEmail: data.customer?.email,
  });
}
