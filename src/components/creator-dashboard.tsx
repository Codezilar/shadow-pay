"use client";

import { useState } from "react";

export type DashboardProfile = {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  approved: boolean;
  creatorSharePercent: number;
  paystackSplitCode: string | null;
  paystackSubaccountCode: string | null;
  user: { email: string; name: string | null };
};

function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

export function CreatorDashboard({
  profile,
  totalAmountKobo,
  successfulCount,
}: {
  profile: DashboardProfile;
  totalAmountKobo: number;
  successfulCount: number;
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const payLink = `${origin}/p/${profile.slug}`;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/creator/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Could not save");
      return;
    }
    setMsg("Saved.");
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Creator dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">Signed in as {profile.user.email}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Status</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {profile.approved ? "Live" : "Pending approval"}
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Successful sales</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{successfulCount}</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Gross volume (verified)</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{formatNgnFromKobo(totalAmountKobo)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Your payment link</h2>
        <p className="mt-1 text-sm text-zinc-500">Share this URL to collect payments in NGN via Paystack.</p>
        <code className="mt-4 block break-all rounded-xl bg-zinc-100 px-3 py-2 text-sm text-zinc-800 dark:bg-zinc-900 dark:text-zinc-200">
          {payLink || `/p/${profile.slug}`}
        </code>
        <dl className="mt-4 grid gap-2 text-sm text-zinc-600 dark:text-zinc-400">
          <div className="flex justify-between gap-4">
            <dt>Your revenue share (agreement)</dt>
            <dd className="font-mono text-zinc-900 dark:text-zinc-100">{profile.creatorSharePercent}%</dd>
          </div>
          {profile.paystackSplitCode && (
            <div className="flex justify-between gap-4">
              <dt>Paystack split code</dt>
              <dd className="font-mono text-xs text-zinc-900 dark:text-zinc-100">{profile.paystackSplitCode}</dd>
            </div>
          )}
        </dl>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-950">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">Public profile</h2>
        <p className="mt-1 text-sm text-zinc-500">Customers see this on your payment page.</p>
        {msg && <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">{msg}</p>}
        {err && (
          <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
            {err}
          </p>
        )}
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Display name</span>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <label className="mt-4 flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Bio</span>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={4}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="mt-4 rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-800 disabled:opacity-60 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          {loading ? "Saving…" : "Save profile"}
        </button>
      </form>
    </div>
  );
}
