"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { HeaderAuth } from "@/components/header-auth";

export function SiteHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const showForCreators = !session && !isAuthRoute;

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200/80 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          CreatorPay <span className="text-emerald-600 dark:text-emerald-400">NG</span>
        </Link>
        <nav className="flex items-center gap-6 text-sm text-zinc-600 dark:text-zinc-400">
          {!session && (
            <Link href="/" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              Home
            </Link>
          )}
          {showForCreators && (
            <Link href="/register" className="hover:text-zinc-900 dark:hover:text-zinc-100">
              For creators
            </Link>
          )}
          <HeaderAuth />
        </nav>
      </div>
    </header>
  );
}
