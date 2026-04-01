import { PaymentComplete } from "@/components/payment-complete";
import { Suspense } from "react";

type Props = { params: Promise<{ slug: string }> };

export default async function PaymentCompletePage({ params }: Props) {
  const { slug } = await params;

  return (
    <div className="flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading…</p>}>
        <PaymentComplete slug={slug} />
      </Suspense>
    </div>
  );
}
