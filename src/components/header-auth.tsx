"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export function HeaderAuth() {
  const { data: session } = useSession();

  return (
    <>
      {session?.user?.role === "CREATOR" && (
        <Link href="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Dashboard
        </Link>
      )}
      {session?.user?.role === "ADMIN" && (
        <Link href="/admin" className="hover:text-zinc-900 dark:hover:text-zinc-100">
          Admin
        </Link>
      )}
      {!session?.user ? (
        <Link
          href="/login"
          className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-emerald-600 dark:hover:bg-emerald-500"
        >
          Log in
        </Link>
      ) : (
        <div className="flex items-center gap-3">
          <span className="hidden max-w-[140px] truncate text-xs text-zinc-500 sm:inline">{session.user.email}</span>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-full border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-800 hover:bg-zinc-50 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-900"
          >
            Sign out
          </button>
        </div>
      )}
    </>
  );
}
