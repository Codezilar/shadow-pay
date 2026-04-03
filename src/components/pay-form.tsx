"use client";

import { useState } from "react";

type Creator = {
  slug: string;
  displayName: string;
  bio: string | null;
  creatorSharePercent: number;
  paymentAmounts?: number[];
  courseTitle: string;
  courseDescription: string;
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
          <label className="text-sm font-medium text-slate-200">Course Price (NGN)</label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {creator.paymentAmounts!.map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => setAmount(preset.toString())}
                className={`rounded-2xl border px-3 py-3 text-sm font-semibold ${
                  Number(amount) === preset
                    ? "border-cyan-300/55 bg-cyan-300/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.18)]"
                    : "border-white/12 bg-white/5 text-slate-200 hover:bg-white/8"
                }`}
              >
                {formatNgnFromKobo(preset * 100)}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-slate-200">Amount (NGN)</span>
          <input
            required
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="sci-input rounded-2xl px-4 py-3 text-lg font-medium"
          />
        </label>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-200">Your email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="sci-input rounded-2xl px-4 py-3"
        />
      </label>
      {amountKobo >= 100_00 && (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300">
          <p className="font-medium text-white">Course Access Notice</p>
          <p className="mt-2 text-xs text-slate-400">
            You’ll gain access to the course community after completing your payment. Ensure your transaction is successful to unlock full participation.
          </p>
          <p className="mt-2 text-xs text-slate-300">
            Admin users can access all communities directly, regardless of enrollment.
          </p>
        </div>
      )}
      {error && (
        <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={loading}
        className="sci-button rounded-full py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
      >
        {loading ? "Redirecting to Paystack…" : "Pay with Paystack"}
      </button>
      <p className="text-center text-xs text-slate-500">Card, bank transfer, USSD, and other Paystack channels.</p>
    </form>
  );
}
