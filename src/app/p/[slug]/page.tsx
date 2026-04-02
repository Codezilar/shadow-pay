import { PayForm } from "@/components/pay-form";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";

type Props = { params: Promise<{ slug: string }> };

export default async function CreatorPayPage({ params }: Props) {
  const { slug } = await params;
  const creator = await prisma.creatorProfile.findFirst({
    where: { slug: slug.toLowerCase(), approved: true },
  });

  if (!creator) {
    notFound();
  }

  return (
    <div className="flex flex-1 flex-col items-center px-4 py-12 sm:py-16">
      <div className="sci-panel w-full max-w-2xl rounded-[34px] p-8">
        <p className="text-xs font-medium uppercase tracking-[0.32em] text-cyan-200">Pay</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[0.04em] text-white">
          {creator.courseTitle || creator.displayName}
        </h1>
        {(creator.courseDescription || creator.bio) ? (
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-slate-300">
            {creator.courseDescription || creator.bio}
          </p>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-2">
          <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
            Secure Paystack checkout
          </span>
          <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-fuchsia-100">
            NGN payment flow
          </span>
        </div>
        <div className="mt-8">
          <PayForm
            creator={{
              slug: creator.slug,
              displayName: creator.displayName,
              bio: creator.bio,
              creatorSharePercent: creator.creatorSharePercent,
              paymentAmounts: JSON.parse(creator.paymentAmountsJson || "[]"),
              courseTitle: creator.courseTitle,
              courseDescription: creator.courseDescription,
            }}
          />
        </div>
      </div>
    </div>
  );
}
