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
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-100">
          CreatorPay <span className="text-cyan-300">NG</span>
        </Link>
        <nav className="flex items-center gap-4 sm:gap-6 text-sm text-slate-300">
          {!session && (
            <Link href="/" className="hover:text-cyan-200">
              Home
            </Link>
          )}
          {showForCreators && (
            <Link href="/register" className="hover:text-cyan-200">
              For creators
            </Link>
          )}
          <HeaderAuth />
        </nav>
      </div>
    </header>
  );
}
