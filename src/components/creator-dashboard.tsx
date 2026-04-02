"use client";

import Link from "next/link";
import { useState } from "react";

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

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const payLink = `${origin}/p/${profile.slug}`;
  const communityLink = `/community/${profile.slug}`;

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
    setWithdrawLoading(true);
    const res = await fetch("/api/creator/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amountNgn: Number(withdrawAmount) }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setWithdrawLoading(false);
    if (!res.ok) {
      setWithdrawErr(data.error || "Could not create withdrawal request");
      return;
    }
    setWithdrawMsg("Withdrawal request submitted. Refresh to see the latest status.");
  }

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10 sm:px-6">
      <div>
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Creator Capsule</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[0.05em] text-white">Creator dashboard</h1>
        <p className="mt-2 text-sm text-slate-400">Signed in as {profile.user.email}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="sci-panel rounded-[28px] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-200/70">Status</p>
          <p className="mt-3 text-lg font-semibold text-white">{profile.approved ? "Live" : "Pending approval"}</p>
        </div>
        <div className="sci-panel rounded-[28px] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-fuchsia-200/70">Successful sales</p>
          <p className="mt-3 text-lg font-semibold text-white">{successfulCount}</p>
        </div>
        <div className="sci-panel rounded-[28px] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-violet-200/70">Gross volume</p>
          <p className="mt-3 text-lg font-semibold text-white">{formatNgnFromKobo(totalAmountKobo)}</p>
        </div>
        <div className="sci-panel rounded-[28px] p-5">
          <p className="text-xs font-medium uppercase tracking-[0.28em] text-emerald-200/70">Available balance</p>
          <p className="mt-3 text-lg font-semibold text-white">{formatNgnFromKobo(availableBalanceKobo)}</p>
          <p className="mt-2 text-xs text-slate-400">Withdrawals open above ₦10,000</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="sci-panel rounded-[30px] p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Commerce links</h2>
                <p className="mt-2 text-sm text-slate-400">Share your course payment page and manage your student hub.</p>
              </div>
              <Link
                href={communityLink}
                className="sci-button-secondary inline-flex rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em]"
              >
                Open community
              </Link>
            </div>
            <code className="mt-4 block break-all rounded-2xl border border-white/10 bg-white/6 px-4 py-3 text-sm text-cyan-100">
              {payLink || `/p/${profile.slug}`}
            </code>
            <dl className="mt-4 grid gap-3 text-sm text-slate-300">
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

          <form onSubmit={save} className="sci-panel rounded-[30px] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-fuchsia-200">Course profile controls</h2>
            <p className="mt-2 text-sm text-slate-400">
              Update the public creator identity and the course information students see before they pay.
            </p>
            {msg && <p className="mt-3 text-sm text-emerald-300">{msg}</p>}
            {err && (
              <p className="mt-3 text-sm text-rose-300" role="alert">
                {err}
              </p>
            )}
            <div className="mt-4 grid gap-4">
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Display name</span>
                <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className="sci-input rounded-2xl px-4 py-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Bio</span>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={4} className="sci-input rounded-2xl px-4 py-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Course title</span>
                <input value={courseTitle} onChange={(e) => setCourseTitle(e.target.value)} className="sci-input rounded-2xl px-4 py-3" />
              </label>
              <label className="flex flex-col gap-1 text-sm">
                <span className="font-medium text-slate-200">Course description</span>
                <textarea
                  value={courseDescription}
                  onChange={(e) => setCourseDescription(e.target.value)}
                  rows={4}
                  className="sci-input rounded-2xl px-4 py-3"
                />
              </label>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="sci-button mt-4 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
            >
              {loading ? "Saving…" : "Save profile"}
            </button>
          </form>
        </div>

        <div className="space-y-6">
          <form onSubmit={requestWithdrawal} className="sci-panel rounded-[30px] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-emerald-200">Withdraw funds</h2>
            <p className="mt-2 text-sm text-slate-400">
              Submit a withdrawal request once your available balance reaches at least ₦10,000.
            </p>
            {withdrawMsg && <p className="mt-3 text-sm text-emerald-300">{withdrawMsg}</p>}
            {withdrawErr && (
              <p className="mt-3 text-sm text-rose-300" role="alert">
                {withdrawErr}
              </p>
            )}
            <label className="mt-4 flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-200">Amount (NGN)</span>
              <input
                inputMode="numeric"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                className="sci-input rounded-2xl px-4 py-3"
              />
            </label>
            <button
              type="submit"
              disabled={withdrawLoading || availableBalanceKobo < 1_000_000}
              className="sci-button mt-4 rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
            >
              {withdrawLoading ? "Sending…" : "Request withdrawal"}
            </button>
          </form>

          <div className="sci-panel rounded-[30px] p-6">
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-cyan-200">Withdrawal queue</h2>
            <div className="mt-4 space-y-3">
              {withdrawals.length === 0 ? (
                <p className="text-sm text-slate-400">No withdrawal requests yet.</p>
              ) : (
                withdrawals.map((request) => (
                  <div key={request.id} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-semibold text-white">{formatNgnFromKobo(request.amountKobo)}</p>
                      <span className="rounded-full border border-cyan-300/25 bg-cyan-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-cyan-100">
                        {request.status.toLowerCase()}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-slate-500">{formatDate(request.createdAt)}</p>
                    {request.adminNote ? <p className="mt-2 text-sm text-slate-300">{request.adminNote}</p> : null}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sci-panel rounded-[30px] p-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-violet-200">Students in this course</h2>
            <p className="mt-2 text-sm text-slate-400">Everyone who has successfully paid for this course and unlocked community access.</p>
          </div>
          <p className="text-sm text-slate-400">{students.length} enrolled students</p>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="min-w-full text-left text-sm text-slate-300">
            <thead className="text-xs uppercase tracking-[0.24em] text-slate-500">
              <tr>
                <th className="pb-3 pr-4">Student</th>
                <th className="pb-3 pr-4">Email</th>
                <th className="pb-3 pr-4">Last payment</th>
                <th className="pb-3">Reference</th>
              </tr>
            </thead>
            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-4 text-sm text-slate-400">
                    No students enrolled yet.
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-t border-white/8">
                    <td className="py-3 pr-4 text-white">{student.name || "Student"}</td>
                    <td className="py-3 pr-4">{student.email}</td>
                    <td className="py-3 pr-4">{formatDate(student.lastPaidAt)}</td>
                    <td className="py-3 font-mono text-xs text-slate-400">{student.lastReference}</td>
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
