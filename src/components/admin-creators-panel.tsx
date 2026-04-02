"use client";

import Link from "next/link";
import { useState } from "react";

type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED";
const withdrawalStatuses: WithdrawalStatus[] = ["PENDING", "PROCESSING", "COMPLETED"];

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
  studentCount: number;
  availableBalanceKobo: number;
  withdrawals: {
    id: string;
    amountKobo: number;
    status: WithdrawalStatus;
    adminNote: string;
    createdAt: string;
  }[];
};

const fieldClassName =
  "mt-1 rounded-2xl border border-white/12 bg-white/6 px-4 py-3 text-[15px] text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)] outline-none transition placeholder:text-slate-500 focus:border-cyan-300/70 focus:bg-white/10 focus:ring-2 focus:ring-cyan-400/30";

const sectionClassName =
  "rounded-[28px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(5,10,30,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl";

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

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
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
  const approvalRate = stats.totalCreators ? Math.round((stats.approvedCreators / stats.totalCreators) * 100) : 0;

  return (
    <section className="relative overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,184,255,0.22),_transparent_32%),radial-gradient(circle_at_80%_12%,_rgba(217,70,239,0.22),_transparent_24%),radial-gradient(circle_at_50%_18%,_rgba(121,249,255,0.18),_transparent_18%),linear-gradient(180deg,_#101935_0%,_#070b19_48%,_#04060f_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(120,144,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(120,144,255,0.16)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -left-24 top-28 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-0 top-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl space-y-6 px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-medium uppercase tracking-[0.38em] text-cyan-300/80">Orbital Creator Command</p>
            <h1 className="mt-3 text-3xl font-semibold tracking-[0.08em] text-white sm:text-4xl">
              Admin control room for creator payouts
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
              Review identities, calibrate revenue splits, and manage course payment systems from a unified sci-fi
              console built for quick decisions.
            </p>
          </div>
          <a
            href="/api/admin/transactions.csv"
            className="inline-flex w-fit items-center justify-center rounded-full border border-cyan-300/40 bg-cyan-300/10 px-5 py-3 text-sm font-semibold text-cyan-100 shadow-[0_0_30px_rgba(34,211,238,0.2)] transition hover:border-cyan-200/70 hover:bg-cyan-300/16"
          >
            Export transaction telemetry
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className={`${sectionClassName} relative overflow-hidden`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.34em] text-cyan-200/70">Creator clearance</p>
            <p className="mt-4 text-3xl font-semibold text-white">{approvalRate}%</p>
            <p className="mt-2 text-sm text-slate-300">
              {stats.approvedCreators} of {stats.totalCreators} creator nodes approved
            </p>
          </div>
          <div className={`${sectionClassName} relative overflow-hidden`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-fuchsia-300/70 to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.34em] text-fuchsia-200/70">Gross volume</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatNgnFromKobo(stats.grossKobo)}</p>
            <p className="mt-2 text-sm text-slate-300">{stats.successfulTransactions} successful transactions logged</p>
          </div>
          <div className={`${sectionClassName} relative overflow-hidden`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-sky-300/70 to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.34em] text-sky-200/70">Creator payout stream</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatNgnFromKobo(stats.creatorPayoutKobo)}</p>
            <p className="mt-2 text-sm text-slate-300">Total routed to creators</p>
          </div>
          <div className={`${sectionClassName} relative overflow-hidden`}>
            <div className="absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-violet-300/70 to-transparent" />
            <p className="text-[11px] uppercase tracking-[0.34em] text-violet-200/70">Platform reserve</p>
            <p className="mt-4 text-3xl font-semibold text-white">{formatNgnFromKobo(stats.platformRevenueKobo)}</p>
            <p className="mt-2 text-sm text-slate-300">Retained by the platform</p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[340px_minmax(0,1fr)]">
          <aside className={`${sectionClassName} p-3`}>
            <div className="rounded-[24px] border border-white/10 bg-black/20 px-4 py-4">
              <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <h2 className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-200/80">Creator profiles</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Select a creator signal to open the full configuration deck.
                  </p>
                </div>
                <div className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-medium tracking-[0.24em] text-cyan-100">
                  {creators.length} online
                </div>
              </div>
              <div className="mt-4 space-y-2">
            {creators.map((creator) => {
              const isActive = creator.id === selectedCreator?.id;

              return (
                <button
                  key={creator.id}
                  type="button"
                  onClick={() => setSelectedCreatorId(creator.id)}
                  className={`group flex w-full items-start gap-3 rounded-[22px] border px-4 py-3 text-left transition ${
                    isActive
                      ? "border-cyan-300/50 bg-cyan-300/12 shadow-[0_0_28px_rgba(34,211,238,0.16)] ring-1 ring-cyan-300/20"
                      : "border-white/0 bg-white/4 hover:border-white/12 hover:bg-white/8"
                  }`}
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(18,24,48,0.92))] text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
                    {getCreatorInitials(creator)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-slate-100">{getCreatorLabel(creator)}</p>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                          creator.approved
                            ? "border-emerald-400/25 bg-emerald-400/12 text-emerald-200"
                            : "border-amber-400/25 bg-amber-400/12 text-amber-200"
                        }`}
                      >
                        {creator.approved ? "Approved" : "Pending"}
                      </span>
                    </div>
                    <p className="mt-1 truncate text-xs text-slate-400">{creator.user.email}</p>
                    <p className="mt-2 text-xs text-slate-500">{creator.studentCount} students · {formatNgnFromKobo(creator.availableBalanceKobo)} free</p>
                    <div className="mt-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.22em] text-slate-500">
                      <span className="h-1.5 w-1.5 rounded-full bg-cyan-300/70 transition group-hover:bg-cyan-200" />
                      /p/{creator.slug}
                    </div>
                  </div>
                </button>
              );
            })}
                {creators.length === 0 && <p className="px-2 py-4 text-sm text-slate-400">No creators detected yet.</p>}
              </div>
            </div>
          </aside>
          <div>
            {selectedCreator ? (
              <AdminCreatorCard key={selectedCreator.id} initial={selectedCreator} />
            ) : (
              <div className={`${sectionClassName} border-dashed p-8 text-sm text-slate-400`}>
                Select a creator profile to begin editing.
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function AdminCreatorCard({ initial }: { initial: AdminCreatorRow }) {
  const [row, setRow] = useState(initial);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawals, setWithdrawals] = useState(initial.withdrawals);
  const [withdrawalMsg, setWithdrawalMsg] = useState<string | null>(null);
  const [withdrawalErr, setWithdrawalErr] = useState<string | null>(null);
  const paymentPreview =
    row.paymentAmounts.length > 0
      ? `${row.paymentAmounts.length} configured tiers`
      : "Open amount entry enabled";

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

  async function updateWithdrawalStatus(id: string, status: WithdrawalStatus, adminNote: string) {
    setWithdrawalMsg(null);
    setWithdrawalErr(null);
    const res = await fetch(`/api/admin/withdrawals/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      request?: (typeof withdrawals)[number];
    };
    if (!res.ok || !data.request) {
      setWithdrawalErr(data.error || "Could not update withdrawal");
      return;
    }
    setWithdrawals((current) => current.map((item) => (item.id === id ? { ...item, ...data.request } : item)));
    setWithdrawalMsg("Withdrawal status updated.");
  }

  return (
    <form
      onSubmit={save}
      className={`${sectionClassName} overflow-hidden p-6 sm:p-7`}
    >
      <div className="flex flex-col gap-5 border-b border-white/10 pb-6 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.36em] text-cyan-300/75">Selected profile</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[0.04em] text-white">{getCreatorLabel(row)}</h2>
          <p className="mt-2 text-sm text-slate-400">
            {row.user.email} {row.user.name ? `· ${row.displayName}` : ""} · /p/{row.slug}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
              Share {row.creatorSharePercent}%
            </span>
            <span className="rounded-full border border-fuchsia-300/25 bg-fuchsia-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-fuchsia-100">
              {paymentPreview}
            </span>
            <span className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-emerald-100">
              {row.studentCount} students
            </span>
            <span className="rounded-full border border-violet-300/25 bg-violet-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-violet-100">
              Available {formatNgnFromKobo(row.availableBalanceKobo)}
            </span>
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href={`/community/${row.slug}`}
              className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"
            >
              Open community
            </Link>
            <Link
              href="/admin/communities"
              className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
            >
              Community hub
            </Link>
          </div>
        </div>
        <label className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/6 px-4 py-3 text-sm text-slate-200">
          <input
            type="checkbox"
            checked={row.approved}
            onChange={(e) => setRow({ ...row, approved: e.target.checked })}
            className="h-4 w-4 rounded border-white/30 bg-transparent text-cyan-400 focus:ring-cyan-400"
          />
          Approved and live
        </label>
      </div>

      {msg && <p className="mt-4 text-sm text-emerald-300">{msg}</p>}
      {err && (
        <p className="mt-4 text-sm text-rose-300" role="alert">
          {err}
        </p>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)]">
        <div className="space-y-4">
          <div className={sectionClassName}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200/75">Identity matrix</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Display name</span>
          <input
            value={row.displayName}
            onChange={(e) => setRow({ ...row, displayName: e.target.value })}
                  className={fieldClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Creator share (%)</span>
          <input
            type="number"
            min={0}
            max={100}
            value={row.creatorSharePercent}
            onChange={(e) => setRow({ ...row, creatorSharePercent: Number(e.target.value) })}
                  className={fieldClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="font-medium text-slate-200">Course title</span>
          <input
            value={row.courseTitle}
            onChange={(e) => setRow({ ...row, courseTitle: e.target.value })}
            placeholder="e.g., Complete Web Development Course"
                  className={fieldClassName}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="font-medium text-slate-200">Course description</span>
          <textarea
            value={row.courseDescription}
            onChange={(e) => setRow({ ...row, courseDescription: e.target.value })}
            rows={3}
            placeholder="Describe what students will learn in this course..."
                  className={`${fieldClassName} min-h-28 resize-y`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="font-medium text-slate-200">Bio</span>
          <textarea
            value={row.bio}
            onChange={(e) => setRow({ ...row, bio: e.target.value })}
            rows={3}
                  className={`${fieldClassName} min-h-28 resize-y`}
          />
        </label>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className={sectionClassName}>
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-fuchsia-200/75">Payment systems</p>
            <div className="mt-4 grid gap-4">
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
                <span className="font-medium text-slate-200">
            Payment amounts (NGN){" "}
                  <span className="text-xs font-normal text-slate-500">comma-separated, e.g., 5000,10000,50000</span>
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
                  className={fieldClassName}
          />
                <p className="text-xs leading-5 text-slate-400">
                  Leave empty to allow any amount. Keep values configured to restrict payment options to fixed tiers.
                </p>
        </label>
        <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Paystack split code</span>
          <input
            value={row.paystackSplitCode ?? ""}
            onChange={(e) => setRow({ ...row, paystackSplitCode: e.target.value || null })}
            placeholder="SPL_..."
                  className={`${fieldClassName} font-mono text-xs tracking-[0.16em]`}
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Paystack subaccount code</span>
          <input
            value={row.paystackSubaccountCode ?? ""}
            onChange={(e) => setRow({ ...row, paystackSubaccountCode: e.target.value || null })}
            placeholder="ACCT_..."
                  className={`${fieldClassName} font-mono text-xs tracking-[0.16em]`}
          />
        </label>
            </div>
          </div>

          <div className={sectionClassName}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-emerald-200/75">Withdrawal queue</p>
                <p className="mt-2 text-sm text-slate-400">Creators see these statuses in their dashboard.</p>
              </div>
              <p className="text-xs text-slate-500">{withdrawals.length} requests</p>
            </div>
            {withdrawalMsg && <p className="mt-3 text-sm text-emerald-300">{withdrawalMsg}</p>}
            {withdrawalErr && <p className="mt-3 text-sm text-rose-300">{withdrawalErr}</p>}
            <div className="mt-4 space-y-3">
              {withdrawals.length === 0 ? (
                <p className="text-sm text-slate-400">No withdrawal requests for this creator yet.</p>
              ) : (
                withdrawals.map((request) => (
                  <WithdrawalRow key={request.id} request={request} onSave={updateWithdrawalStatus} />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 inline-flex rounded-full border border-cyan-300/40 bg-cyan-300/12 px-5 py-3 text-sm font-semibold text-cyan-50 shadow-[0_0_30px_rgba(34,211,238,0.18)] transition hover:bg-cyan-300/20 disabled:opacity-60"
      >
        {loading ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}

function WithdrawalRow({
  request,
  onSave,
}: {
  request: AdminCreatorRow["withdrawals"][number];
  onSave: (id: string, status: WithdrawalStatus, adminNote: string) => Promise<void>;
}) {
  const [status, setStatus] = useState(request.status);
  const [adminNote, setAdminNote] = useState(request.adminNote);
  const [saving, setSaving] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-semibold text-white">{formatNgnFromKobo(request.amountKobo)}</p>
          <p className="mt-1 text-xs text-slate-500">{formatDate(request.createdAt)}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as WithdrawalStatus)}
            className="rounded-full border border-white/12 bg-white/8 px-3 py-2 text-xs uppercase tracking-[0.16em] text-slate-100"
          >
            {withdrawalStatuses.map((item) => (
              <option key={item} value={item} className="bg-slate-950">
                {item}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={saving}
            onClick={async () => {
              setSaving(true);
              await onSave(request.id, status, adminNote);
              setSaving(false);
            }}
            className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100 disabled:opacity-60"
          >
            {saving ? "Updating…" : "Update"}
          </button>
        </div>
      </div>
      <textarea
        value={adminNote}
        onChange={(e) => setAdminNote(e.target.value)}
        rows={2}
        placeholder="Optional admin note visible to the creator"
        className={`${fieldClassName} min-h-20 resize-y`}
      />
    </div>
  );
}
