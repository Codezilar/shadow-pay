"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session } = useSession();

  return (
    <>
      {session?.user?.role === "CREATOR" && (
        <Link href="/dashboard" className="hover:text-cyan-200">
          Dashboard
        </Link>
      )}
      {session?.user?.role === "ADMIN" && (
        <>
          <Link href="/admin" className="hover:text-cyan-200">
            Creators
          </Link>
          <Link href="/admin/communities" className="hover:text-cyan-200">
            Communities
          </Link>
          <Link href="/admin/withdrawals" className="hover:text-cyan-200">
            Withdrawals
          </Link>
        </>
      )}
      {!session?.user ? (
        <Link
          href="/login"
          className="sci-button rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
        >
          Log in
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[160px] truncate text-xs text-slate-400 sm:inline">{session.user.email}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="sci-button-secondary rounded-full px-3.5 py-1.5 text-xs font-semibold uppercase tracking-[0.18em]"
          >
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
