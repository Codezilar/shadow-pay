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
      <div className="w-full max-w-lg rounded-3xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-700 dark:text-emerald-400">Pay</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {creator.displayName}
        </h1>
        {creator.bio ? (
          <p className="mt-3 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">{creator.bio}</p>
        ) : null}
        <div className="mt-8">
          <PayForm
            creator={{
              slug: creator.slug,
              displayName: creator.displayName,
              bio: creator.bio,
              creatorSharePercent: creator.creatorSharePercent,
              paymentAmounts: JSON.parse(creator.paymentAmountsJson || "[]"),
            }}
          />
        </div>
      </div>
    </div>
  );
}
