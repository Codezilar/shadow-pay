"use client";

import { useState } from "react";

type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED";
const statusOptions: WithdrawalStatus[] = ["PENDING", "PROCESSING", "COMPLETED"];

export type AdminWithdrawalRow = {
  id: string;
  amountKobo: number;
  status: WithdrawalStatus;
  adminNote: string;
  createdAt: string;
  processedAt: string | null;
  creator: {
    id: string;
    slug: string;
    displayName: string;
    email: string;
    availableKobo: number;
    balanceKobo: number;
    pendingReservedKobo: number;
  };
};

function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

function formatDate(value: string | null) {
  if (!value) return "Not processed yet";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function uiStatusLabel(status: WithdrawalStatus) {
  if (status === "PROCESSING") return "Under View";
  if (status === "COMPLETED") return "Completed";
  return "Pending";
}

export function AdminWithdrawalsPanel({ withdrawals }: { withdrawals: AdminWithdrawalRow[] }) {
  return (
    <section className="relative overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,184,255,0.22),_transparent_32%),radial-gradient(circle_at_80%_12%,_rgba(217,70,239,0.22),_transparent_24%),radial-gradient(circle_at_50%_18%,_rgba(121,249,255,0.18),_transparent_18%),linear-gradient(180deg,_#101935_0%,_#070b19_48%,_#04060f_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(120,144,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(120,144,255,0.16)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -left-24 top-28 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-0 top-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.38em] text-cyan-300/80">Withdrawal Control</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0.08em] text-white sm:text-4xl">
            Review and complete creator withdrawal requests
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Move requests through `Pending`, `Under View`, and `Completed`. Completed withdrawals reduce the creator&apos;s
            actual balance, while pending requests remain only reserved.
          </p>
        </div>

        <div className="mt-6 grid gap-4">
          {withdrawals.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/14 bg-slate-950/35 p-8 text-sm text-slate-400">
              No withdrawal requests yet.
            </div>
          ) : (
            withdrawals.map((request) => <WithdrawalCard key={request.id} initial={request} />)
          )}
        </div>
      </div>
    </section>
  );
}

function WithdrawalCard({ initial }: { initial: AdminWithdrawalRow }) {
  const [row, setRow] = useState(initial);
  const [status, setStatus] = useState<WithdrawalStatus>(initial.status);
  const [adminNote, setAdminNote] = useState(initial.adminNote);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setMsg(null);
    setErr(null);

    const res = await fetch(`/api/admin/withdrawals/${row.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNote }),
    });
    const data = (await res.json().catch(() => ({}))) as {
      error?: string;
      request?: {
        id: string;
        amountKobo: number;
        status: WithdrawalStatus;
        adminNote: string;
        createdAt: string;
        processedAt: string | null;
        creator?: {
          availableKobo: number;
          balanceKobo: number;
          pendingReservedKobo: number;
        };
      };
    };
    setLoading(false);

    if (!res.ok || !data.request) {
      setErr(data.error || "Could not update request");
      return;
    }

    setRow((current) => ({
      ...current,
      ...data.request!,
      creator: data.request?.creator
        ? { ...current.creator, ...data.request.creator }
        : current.creator,
    }));
    setStatus(data.request.status);
    setAdminNote(data.request.adminNote);
    setMsg("Withdrawal request updated.");
  }

  return (
    <article className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(5,10,30,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-xl font-semibold text-white">{row.creator.displayName}</p>
            <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-cyan-100">
              {uiStatusLabel(row.status)}
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-400">
            {row.creator.email} · /p/{row.creator.slug}
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <StatCard label="Request" value={formatNgnFromKobo(row.amountKobo)} tone="cyan" />
            <StatCard label="Balance" value={formatNgnFromKobo(row.creator.balanceKobo)} tone="violet" />
            <StatCard label="Reserved" value={formatNgnFromKobo(row.creator.pendingReservedKobo)} tone="amber" />
          </div>
          <p className="mt-4 text-xs text-slate-500">
            Requested {formatDate(row.createdAt)} · Processed {formatDate(row.processedAt)}
          </p>
        </div>

        <div className="w-full max-w-xl rounded-[24px] border border-white/10 bg-white/5 p-4">
          {msg ? <p className="mb-3 text-sm text-emerald-300">{msg}</p> : null}
          {err ? <p className="mb-3 text-sm text-rose-300">{err}</p> : null}
          <div className="grid gap-4 sm:grid-cols-[180px_minmax(0,1fr)]">
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-200">Request status</span>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as WithdrawalStatus)}
                className="rounded-2xl border border-white/12 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none"
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option} className="bg-slate-950">
                    {uiStatusLabel(option)}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2 text-sm">
              <span className="font-medium text-slate-200">Admin note</span>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={3}
                className="rounded-2xl border border-white/12 bg-slate-950/45 px-4 py-3 text-slate-100 outline-none"
                placeholder="Add a note for the creator"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="rounded-full border border-cyan-300/35 bg-cyan-300/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Update request"}
            </button>
            <p className="text-xs text-slate-500">
              Available to request now: {formatNgnFromKobo(row.creator.availableKobo)}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "cyan" | "violet" | "amber";
}) {
  const toneClasses = {
    cyan: "border-cyan-300/14 bg-cyan-300/8 text-cyan-200/70",
    violet: "border-violet-300/14 bg-violet-300/8 text-violet-200/70",
    amber: "border-amber-300/14 bg-amber-300/8 text-amber-200/70",
  } as const;

  return (
    <div className={`rounded-2xl border px-3 py-3 ${toneClasses[tone]}`}>
      <p className="text-[11px] uppercase tracking-[0.2em]">{label}</p>
      <p className="mt-2 text-lg font-semibold text-white">{value}</p>
    </div>
  );
}
