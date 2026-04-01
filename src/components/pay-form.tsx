"use client";

import { useState } from "react";

type Creator = {
  slug: string;
  displayName: string;
  bio: string | null;
  creatorSharePercent: number;
  paymentAmounts?: number[];
};

function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

export function PayForm({ creator }: { creator: Creator }) {
  const [amount, setAmount] = useState(
    (creator.paymentAmounts && creator.paymentAmounts.length > 0
      ? creator.paymentAmounts[0]
      : 10000).toString()
  );
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const hasPresetAmounts = creator.paymentAmounts && creator.paymentAmounts.length > 0;

  const amountNum = Number(amount);
  const amountKobo = Number.isFinite(amountNum) ? Math.round(amountNum * 100) : 0;
  const creatorKobo = Math.floor((amountKobo * creator.creatorSharePercent) / 100);
  const platformKobo = amountKobo - creatorKobo;

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      setError("Enter a valid amount.");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/paystack/initialize", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        slug: creator.slug,
        amountNgn: amountNum,
        customerEmail: email,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; authorizationUrl?: string };
    setLoading(false);
    if (!res.ok || !data.authorizationUrl) {
      setError(data.error || "Could not start checkout");
      return;
    }
    window.location.href = data.authorizationUrl;
  }

  return (
    <form onSubmit={pay} className="flex flex-col gap-5">
      {hasPresetAmounts ? (
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Select amount (NGN)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {creator.paymentAmounts!.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`rounded-lg border-2 px-3 py-2.5 text-sm font-semibold transition-colors ${
                  Number(amount) === preset
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 dark:border-emerald-400 dark:bg-emerald-950 dark:text-emerald-100"
                    : "border-zinc-200 bg-white text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-800"
                }`}
              >
                {formatNgnFromKobo(preset * 100)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Amount (NGN)</span>
          <input
            required
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-lg font-medium text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Your email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      {amountKobo >= 100_00 && (
        <div className="rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900/50 dark:text-zinc-400">
          <p className="font-medium text-zinc-800 dark:text-zinc-200">Split preview (agreement on file)</p>
          <ul className="mt-2 space-y-1">
            <li>
              Creator ({creator.creatorSharePercent}%):{" "}
              <span className="font-mono text-zinc-900 dark:text-zinc-100">{formatNgnFromKobo(creatorKobo)}</span>
            </li>
            <li>
              Platform:{" "}
              <span className="font-mono text-zinc-900 dark:text-zinc-100">{formatNgnFromKobo(platformKobo)}</span>
            </li>
          </ul>
          <p className="mt-2 text-xs text-zinc-500">
            Actual settlement follows your Paystack split / subaccount setup. This preview reflects the percentages stored
            for this creator.
          </p>
        </div>
      )}
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="rounded-xl bg-emerald-600 py-3 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Redirecting to Paystack…" : "Pay with Paystack"}
      </button>
      <p className="text-center text-xs text-zinc-500">Card, bank transfer, USSD, and other Paystack channels.</p>
    </form>
  );
}
