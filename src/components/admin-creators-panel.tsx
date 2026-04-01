"use client";

import { useState } from "react";

export type AdminCreatorRow = {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  approved: boolean;
  creatorSharePercent: number;
  paystackSplitCode: string | null;
  paystackSubaccountCode: string | null;
  paymentAmounts: number[];
  courseTitle: string;
  courseDescription: string;
  user: { email: string; name: string | null };
};

function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

function getCreatorLabel(creator: AdminCreatorRow) {
  return creator.user.name?.trim() || creator.displayName || creator.user.email;
}

function getCreatorInitials(creator: AdminCreatorRow) {
  const source = getCreatorLabel(creator)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return source || creator.user.email.slice(0, 2).toUpperCase();
}

export function AdminCreatorsPanel({
  creators,
  stats,
}: {
  creators: AdminCreatorRow[];
  stats: {
    totalCreators: number;
    approvedCreators: number;
    successfulTransactions: number;
    grossKobo: number;
    creatorPayoutKobo: number;
    platformRevenueKobo: number;
  };
}) {
  const [selectedCreatorId, setSelectedCreatorId] = useState(creators[0]?.id ?? null);
  const selectedCreator = creators.find((creator) => creator.id === selectedCreatorId) ?? creators[0] ?? null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 sm:px-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Creators</h1>
          <p className="mt-1 text-sm text-zinc-500">
            Review creator profiles, open one record at a time, and manage payout settings without a crowded form.
          </p>
        </div>
        <a
          href="/api/admin/transactions.csv"
          className="inline-flex w-fit items-center justify-center rounded-xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
        >
          Export transactions CSV
        </a>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Creators</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
            {stats.approvedCreators}/{stats.totalCreators} approved
          </p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Gross volume</p>
          <p className="mt-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">{formatNgnFromKobo(stats.grossKobo)}</p>
          <p className="mt-1 text-xs text-zinc-500">{stats.successfulTransactions} successful payments</p>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-950">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Revenue split totals</p>
          <p className="mt-2 text-sm text-zinc-700 dark:text-zinc-300">
            Creator: <span className="font-mono">{formatNgnFromKobo(stats.creatorPayoutKobo)}</span>
          </p>
          <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-300">
            Platform: <span className="font-mono">{formatNgnFromKobo(stats.platformRevenueKobo)}</span>
          </p>
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
          <div className="border-b border-zinc-200 px-2 pb-3 dark:border-zinc-800">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-zinc-500">Creator profiles</h2>
            <p className="mt-1 text-sm text-zinc-500">Select a creator to open the full admin form.</p>
          </div>
          <div className="mt-3 space-y-2">
            {creators.map((creator) => {
              const isActive = creator.id === selectedCreator?.id;

              return (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => setSelectedCreatorId(creator.id)}
                  className={`flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    isActive
                      ? "border-emerald-300 bg-emerald-50 ring-1 ring-emerald-200 dark:border-emerald-700 dark:bg-emerald-950/40 dark:ring-emerald-800"
                      : "border-transparent bg-zinc-50 hover:border-zinc-200 hover:bg-white dark:bg-zinc-900/60 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-sm font-semibold text-white dark:bg-zinc-100 dark:text-zinc-900">
                    {getCreatorInitials(creator)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                        {getCreatorLabel(creator)}
                      </p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                          creator.approved
                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300"
                        }`}
                      >
                        {creator.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-zinc-500">{creator.user.email}</p>
                    <p className="mt-2 truncate text-xs text-zinc-500">/{`p/${creator.slug}`}</p>
                  </div>
                </button>
              );
            })}
            {creators.length === 0 && <p className="px-2 py-4 text-sm text-zinc-500">No creators yet.</p>}
          </div>
        </aside>
        <div>
          {selectedCreator ? (
            <AdminCreatorCard key={selectedCreator.id} initial={selectedCreator} />
          ) : (
            <div className="rounded-2xl border border-dashed border-zinc-300 bg-zinc-50 p-8 text-sm text-zinc-500 dark:border-zinc-700 dark:bg-zinc-950">
              Select a creator profile to begin editing.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminCreatorCard({ initial }: { initial: AdminCreatorRow }) {
  const [row, setRow] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    const res = await fetch(`/api/admin/creators/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        approved: row.approved,
        creatorSharePercent: row.creatorSharePercent,
        paystackSplitCode: row.paystackSplitCode || null,
        paystackSubaccountCode: row.paystackSubaccountCode || null,
        displayName: row.displayName,
        bio: row.bio,
        paymentAmounts: row.paymentAmounts,
        courseTitle: row.courseTitle,
        courseDescription: row.courseDescription,
      }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string; profile?: AdminCreatorRow };
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Update failed");
      return;
    }
    if (data.profile) {
      setRow({
        ...row,
        ...data.profile,
        user: row.user,
      });
    }
    setMsg("Saved.");
  }

  return (
    <form
      onSubmit={save}
      className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div className="flex flex-col justify-between gap-4 border-b border-zinc-200 pb-5 dark:border-zinc-800 sm:flex-row sm:items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-zinc-500">Selected profile</p>
          <h2 className="mt-2 text-xl font-semibold text-zinc-900 dark:text-zinc-50">{getCreatorLabel(row)}</h2>
          <p className="mt-1 text-sm text-zinc-500">
            {row.user.email} {row.user.name ? `· ${row.displayName}` : ""} · /p/{row.slug}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
          <input
            type="checkbox"
            checked={row.approved}
            onChange={(e) => setRow({ ...row, approved: e.target.checked })}
            className="h-4 w-4 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-500"
          />
          Approved (payment link live)
        </label>
      </div>

      {msg && <p className="mt-3 text-sm text-emerald-700 dark:text-emerald-400">{msg}</p>}
      {err && (
        <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
          {err}
        </p>
      )}

      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Display name</span>
          <input
            value={row.displayName}
            onChange={(e) => setRow({ ...row, displayName: e.target.value })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Creator share (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={row.creatorSharePercent}
            onChange={(e) => setRow({ ...row, creatorSharePercent: Number(e.target.value) })}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Course title</span>
          <input
            value={row.courseTitle}
            onChange={(e) => setRow({ ...row, courseTitle: e.target.value })}
            placeholder="e.g., Complete Web Development Course"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Course description</span>
          <textarea
            value={row.courseDescription}
            onChange={(e) => setRow({ ...row, courseDescription: e.target.value })}
            rows={3}
            placeholder="Describe what students will learn in this course..."
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Bio</span>
          <textarea
            value={row.bio}
            onChange={(e) => setRow({ ...row, bio: e.target.value })}
            rows={3}
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">
            Payment amounts (NGN) <span className="text-xs font-normal text-zinc-500">comma-separated, e.g., 5000,10000,50000</span>
          </span>
          <input
            value={row.paymentAmounts.join(", ")}
            onChange={(e) => {
              const amounts = e.target.value
                .split(",")
                .map((s) => Number(s.trim()))
                .filter((n) => Number.isFinite(n) && n > 0);
              setRow({ ...row, paymentAmounts: amounts });
            }}
            placeholder="5000, 10000, 50000"
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <p className="text-xs text-zinc-500">Leave empty to allow any amount. Leave configured amounts to restrict payment options.</p>
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Paystack split code</span>
          <input
            value={row.paystackSplitCode ?? ""}
            onChange={(e) => setRow({ ...row, paystackSplitCode: e.target.value || null })}
            placeholder="SPL_..."
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium text-zinc-700 dark:text-zinc-300">Paystack subaccount code</span>
          <input
            value={row.paystackSubaccountCode ?? ""}
            onChange={(e) => setRow({ ...row, paystackSubaccountCode: e.target.value || null })}
            placeholder="ACCT_..."
            className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-xs dark:border-zinc-700 dark:bg-zinc-900"
          />
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-4 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
