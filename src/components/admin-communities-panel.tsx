"use client";

import Link from "next/link";

export type AdminCommunityRow = {
  id: string;
  slug: string;
  displayName: string;
  courseTitle: string;
  courseDescription: string;
  approved: boolean;
  memberCount: number;
  messageCount: number;
  latestMessageAt: string | null;
  user: {
    email: string;
    name: string | null;
  };
};

function formatDate(value: string | null) {
  if (!value) return "No activity yet";
  return new Intl.DateTimeFormat("en-NG", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

function getLabel(row: AdminCommunityRow) {
  return row.courseTitle || row.displayName || row.user.name || row.user.email;
}

function getInitials(row: AdminCommunityRow) {
  return getLabel(row)
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function AdminCommunitiesPanel({ communities }: { communities: AdminCommunityRow[] }) {
  return (
    <section className="relative overflow-hidden bg-[#050816] text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(90,184,255,0.22),_transparent_32%),radial-gradient(circle_at_80%_12%,_rgba(217,70,239,0.22),_transparent_24%),radial-gradient(circle_at_50%_18%,_rgba(121,249,255,0.18),_transparent_18%),linear-gradient(180deg,_#101935_0%,_#070b19_48%,_#04060f_100%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(120,144,255,0.16)_1px,transparent_1px),linear-gradient(90deg,rgba(120,144,255,0.16)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="absolute -left-24 top-28 h-64 w-64 rounded-full bg-cyan-400/20 blur-3xl" />
      <div className="absolute right-0 top-12 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.38em] text-cyan-300/80">Community Command</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-[0.08em] text-white sm:text-4xl">
            Admin access to creator communities
          </h1>
          <p className="mt-3 text-sm leading-6 text-slate-300 sm:text-base">
            Review course rooms, inspect activity, and enter any creator community directly as an admin without using a
            payment access token.
          </p>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {communities.map((community) => (
            <article
              key={community.id}
              className="rounded-[28px] border border-white/10 bg-slate-950/45 p-5 shadow-[0_20px_60px_rgba(5,10,30,0.45),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border border-white/12 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.28),rgba(18,24,48,0.92))] text-sm font-semibold text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.16)]">
                    {getInitials(community)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-lg font-semibold text-white">{getLabel(community)}</p>
                    <p className="mt-1 truncate text-xs text-slate-400">{community.user.email}</p>
                  </div>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.2em] ${
                    community.approved
                      ? "border-emerald-400/25 bg-emerald-400/12 text-emerald-200"
                      : "border-amber-400/25 bg-amber-400/12 text-amber-200"
                  }`}
                >
                  {community.approved ? "Live" : "Pending"}
                </span>
              </div>

              <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-300">
                {community.courseDescription || "No course description yet for this community."}
              </p>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-cyan-300/14 bg-cyan-300/8 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-cyan-200/70">Members</p>
                  <p className="mt-2 text-lg font-semibold text-white">{community.memberCount}</p>
                </div>
                <div className="rounded-2xl border border-fuchsia-300/14 bg-fuchsia-300/8 px-3 py-3">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-fuchsia-200/70">Posts</p>
                  <p className="mt-2 text-lg font-semibold text-white">{community.messageCount}</p>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-500">Latest activity</p>
                <p className="mt-2 text-sm text-slate-300">{formatDate(community.latestMessageAt)}</p>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/community/${community.slug}`}
                  className="inline-flex rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-100"
                >
                  Open community
                </Link>
                <Link
                  href="/admin"
                  className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
                >
                  Back to creators
                </Link>
              </div>
            </article>
          ))}

          {communities.length === 0 ? (
            <div className="rounded-[28px] border border-dashed border-white/14 bg-slate-950/35 p-8 text-sm text-slate-400">
              No creator communities found yet.
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}
