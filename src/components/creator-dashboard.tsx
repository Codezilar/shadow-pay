"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type WithdrawalStatus = "PENDING" | "PROCESSING" | "COMPLETED";

export type DashboardStudent = {
  id: string;
  email: string;
  name: string | null;
  lastPaidAt: string;
  lastReference: string;
};

export type DashboardWithdrawal = {
  id: string;
  amountKobo: number;
  status: WithdrawalStatus;
  adminNote: string;
  createdAt: string;
};

export type DashboardProfile = {
  id: string;
  slug: string;
  displayName: string;
  bio: string;
  approved: boolean;
  creatorSharePercent: number;
  paystackSplitCode: string | null;
  paystackSubaccountCode: string | null;
  courseTitle: string;
  courseDescription: string;
  user: { email: string; name: string | null };
};

type ToastState = {
  tone: "success" | "error";
  message: string;
} | null;

function formatNgnFromKobo(kobo: number) {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN" }).format(kobo / 100);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function CreatorDashboard({
  profile,
  totalAmountKobo,
  successfulCount,
  availableBalanceKobo,
  students,
  withdrawals,
}: {
  profile: DashboardProfile;
  totalAmountKobo: number;
  successfulCount: number;
  availableBalanceKobo: number;
  students: DashboardStudent[];
  withdrawals: DashboardWithdrawal[];
}) {
  const [displayName, setDisplayName] = useState(profile.displayName);
  const [bio, setBio] = useState(profile.bio);
  const [courseTitle, setCourseTitle] = useState(profile.courseTitle);
  const [courseDescription, setCourseDescription] = useState(profile.courseDescription);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState(
    availableBalanceKobo >= 1_000_000 ? (availableBalanceKobo / 100).toFixed(0) : "10000"
  );
  const [withdrawMsg, setWithdrawMsg] = useState<string | null>(null);
  const [withdrawErr, setWithdrawErr] = useState<string | null>(null);
  const [withdrawLoading, setWithdrawLoading] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const payLink = `${origin}/p/${profile.slug}`;
  const communityLink = `/community/${profile.slug}`;

  useEffect(() => {
    if (!toast) return;

    const timeout = window.setTimeout(() => setToast(null), 3200);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    setLoading(true);
    const res = await fetch("/api/creator/me", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ displayName, bio, courseTitle, courseDescription }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setErr(data.error || "Could not save");
      return;
    }
    setMsg("Creator profile updated.");
  }

  async function requestWithdrawal(e: React.FormEvent) {
    e.preventDefault();
    setWithdrawMsg(null);
    setWithdrawErr(null);

    const amountNgn = Number(withdrawAmount);
    if (!Number.isFinite(amountNgn) || amountNgn <= 0) {
      const message = "Enter a valid withdrawal amount.";
      setWithdrawErr(message);
      setToast({ tone: "error", message });
      return;
    }

    if (availableBalanceKobo < 1_000_000) {
      const message = "Available balance must be at least NGN 10,000 before requesting withdrawal.";
      setWithdrawErr(message);
      setToast({ tone: "error", message });
      return;
    }

    if (Math.round(amountNgn * 100) > availableBalanceKobo) {
      const message = "Withdrawal amount exceeds your available balance.";
      setWithdrawErr(message);
      setToast({ tone: "error", message });
      return;
    }

    setWithdrawLoading(true);
    const res = await fetch("/api/creator/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountNgn }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setWithdrawLoading(false);
    if (!res.ok) {
      const message = data.error || "Could not create withdrawal request";
      setWithdrawErr(message);
      setToast({ tone: "error", message });
      return;
    }
    const message = "Withdrawal request submitted. Refresh to see the latest status.";
    setWithdrawMsg(message);
    setToast({ tone: "success", message });
  }

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-3 py-6 sm:gap-8 sm:px-4 sm:py-10">
      {toast ? (
        <div className="pointer-events-none fixed right-3 top-20 z-50 w-[calc(100vw-1.5rem)] max-w-[360px] sm:right-4">
          <div
            className={`rounded-2xl border px-3 py-2.5 shadow-[0_18px_40px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:px-4 sm:py-3 ${
              toast.tone === "success"
                ? "border-emerald-400/30 bg-emerald-400/12 text-emerald-100"
                : "border-rose-400/30 bg-rose-400/12 text-rose-100"
            }`}
            role="status"
            aria-live="polite"
          >
            <p className="text-[10px] font-semibold uppercase tracking-[0.2em] sm:text-xs">
              {toast.tone === "success" ? "Request sent" : "Withdrawal error"}
            </p>
            <p className="mt-1 text-xs sm:text-sm">{toast.message}</p>
          </div>
        </div>
      ) : null}

      <div>
        <p className="text-[10px] uppercase tracking-[0.32em] text-cyan-200/80 sm:text-xs">Creator Capsule</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[0.05em] text-white sm:mt-3 sm:text-3xl">Creator dashboard</h1>
        <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">Signed in as {profile.user.email}</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">
        <div className="sci-panel rounded-[28px] p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-cyan-200/70 sm:text-xs">Status</p>
          <p className="mt-2 text-base font-semibold text-white sm:mt-3 sm:text-lg">{profile.approved ? "Live" : "Pending approval"}</p>
        </div>
        <div className="sci-panel rounded-[28px] p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-fuchsia-200/70 sm:text-xs">Successful sales</p>
          <p className="mt-2 text-base font-semibold text-white sm:mt-3 sm:text-lg">{successfulCount}</p>
        </div>
        <div className="sci-panel rounded-[28px] p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-violet-200/70 sm:text-xs">Gross volume</p>
          <p className="mt-2 text-base font-semibold text-white sm:mt-3 sm:text-lg">{formatNgnFromKobo(totalAmountKobo)}</p>
        </div>
        <div className="sci-panel rounded-[28px] p-4 sm:p-5">
          <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-emerald-200/70 sm:text-xs">Available balance</p>
          <p className="mt-2 text-base font-semibold text-white sm:mt-3 sm:text-lg">{formatNgnFromKobo(availableBalanceKobo)}</p>
          <p className="mt-1 text-[10px] text-slate-400 sm:mt-2 sm:text-xs">Withdrawals open above ₦10,000</p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] xl:gap-6">
        <div className="space-y-5 xl:space-y-6">
          <div className="sci-panel rounded-[30px] p-4 sm:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div>
                <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 sm:text-sm">Commerce links</h2>
                <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">Share your course payment page and manage your student hub.</p>
              </div>
              <Link
                href={communityLink}
                className="sci-button-secondary inline-flex w-fit rounded-full px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] sm:px-4 sm:py-2 sm:text-xs"
              >
                Open community
              </Link>
            </div>
            <code className="mt-3 block break-all rounded-2xl border border-white/10 bg-white/6 px-3 py-2 text-xs text-cyan-100 sm:mt-4 sm:px-4 sm:py-3 sm:text-sm">
              {payLink || `/p/${profile.slug}`}
            </code>
            <dl className="mt-3 grid gap-2 text-xs text-slate-300 sm:mt-4 sm:gap-3 sm:text-sm">
              <div className="flex justify-between gap-4">
                <dt>Revenue share</dt>
                <dd className="font-mono text-white">{profile.creatorSharePercent}%</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Community members</dt>
                <dd className="font-mono text-white">{students.length}</dd>
              </div>
            </dl>
          </div>

          <form onSubmit={save} className="sci-panel rounded-[30px] p-4 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-200 sm:text-sm">Course profile controls</h2>
            <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
              Update the public creator identity and the course information students see before they pay.
            </p>
            {msg && <p className="mt-2 text-xs text-emerald-300 sm:mt-3 sm:text-sm">{msg}</p>}
            {err && (
              <p className="mt-2 text-xs text-rose-300 sm:mt-3 sm:text-sm" role="alert">
                {err}
              </p>
            )}
            <div className="mt-3 grid gap-3 sm:mt-4 sm:gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Display name</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="sci-input rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Bio</span>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="sci-input rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Course title</span>
                <input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="sci-input rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Course description</span>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={4}
                  className="sci-input rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="sci-button mt-3 w-full rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] disabled:opacity-60 sm:mt-4 sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
            >
              {loading ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>

        <div className="space-y-5 xl:space-y-6">
          <form onSubmit={requestWithdrawal} className="sci-panel rounded-[30px] p-4 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-200 sm:text-sm">Withdraw funds</h2>
            <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">
              Submit a withdrawal request once your available balance reaches at least ₦10,000.
            </p>
            {withdrawMsg && <p className="mt-2 text-xs text-emerald-300 sm:mt-3 sm:text-sm">{withdrawMsg}</p>}
            {withdrawErr && (
              <p className="mt-2 text-xs text-rose-300 sm:mt-3 sm:text-sm" role="alert">
                {withdrawErr}
              </p>
            )}
            <label className="mt-3 flex flex-col gap-1 text-sm sm:mt-4">
              <span className="font-medium text-slate-200">Amount (NGN)</span>
              <input
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="sci-input rounded-2xl px-3 py-2.5 sm:px-4 sm:py-3"
              />
            </label>
            <button
              type="submit"
              disabled={withdrawLoading}
              className="sci-button mt-3 w-full rounded-full px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] disabled:opacity-60 sm:mt-4 sm:w-auto sm:px-5 sm:py-3 sm:text-sm"
            >
              {withdrawLoading ? "Sending…" : "Request withdrawal"}
            </button>
            <p className="mt-2 text-[10px] text-slate-500 sm:mt-3 sm:text-xs">
              You&apos;ll get instant feedback here if the amount is invalid or your balance is below the withdrawal threshold.
            </p>
          </form>

          <div className="sci-panel rounded-[30px] p-4 sm:p-6">
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-200 sm:text-sm">Withdrawal queue</h2>
            <div className="mt-3 space-y-2 sm:mt-4 sm:space-y-3">
              {withdrawals.length === 0 ? (
                <p className="text-xs text-slate-400 sm:text-sm">No withdrawal requests yet.</p>
              ) : (
                withdrawals.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-3 sm:p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="font-semibold text-white">{formatNgnFromKobo(request.amountKobo)}</p>
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-2 py-0.5 text-[9px] uppercase tracking-[0.22em] text-cyan-100 sm:px-3 sm:py-1 sm:text-[11px]">
                        {request.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-[10px] text-slate-500 sm:mt-2 sm:text-xs">{formatDate(request.createdAt)}</p>
                    {request.adminNote ? <p className="mt-1 text-xs text-slate-300 sm:mt-2 sm:text-sm">{request.adminNote}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sci-panel rounded-[30px] p-4 sm:p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-violet-200 sm:text-sm">Students in this course</h2>
            <p className="mt-1 text-xs text-slate-400 sm:mt-2 sm:text-sm">Everyone who has successfully paid for this course and unlocked community access.</p>
          </div>
          <p className="text-xs text-slate-400 sm:text-sm">{students.length} enrolled students</p>
        </div>
        <div className="mt-3 overflow-x-auto sm:mt-4">
          <table className="min-w-full text-left text-xs text-slate-300 sm:text-sm">
            <thead className="text-[9px] uppercase tracking-[0.24em] text-slate-500 sm:text-xs">
              <tr>
                <th className="pb-2 pr-2 sm:pb-3 sm:pr-4">Student</th>
                <th className="pb-2 pr-2 sm:pb-3 sm:pr-4">Email</th>
                <th className="pb-2 pr-2 sm:pb-3 sm:pr-4">Last payment</th>
                <th className="pb-2 sm:pb-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-3 text-xs text-slate-400 sm:py-4 sm:text-sm">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-t border-white/8">
                    <td className="py-2 pr-2 text-white sm:py-3 sm:pr-4">{student.name || "Student"}</td>
                    <td className="py-2 pr-2 break-all sm:py-3 sm:pr-4">{student.email}</td>
                    <td className="py-2 pr-2 whitespace-nowrap sm:py-3 sm:pr-4">{formatDate(student.lastPaidAt)}</td>
                    <td className="py-2 font-mono text-[10px] text-slate-400 break-all sm:py-3 sm:text-xs">{student.lastReference}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}