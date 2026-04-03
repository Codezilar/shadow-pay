"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { HeaderAuth } from "@/components/header-auth";

export function SiteHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isAuthRoute = pathname === "/login" || pathname === "/register";
  const showForCreators = !session && !isAuthRoute;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/55 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold uppercase tracking-[0.28em] text-slate-100">
          NexaPay <span className="text-cyan-300">Official</span>
        </Link>
        <nav className="hidden items-center gap-4 text-sm text-slate-300 sm:flex sm:gap-6">
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
        <button
          type="button"
          onClick={() => setOpen((value) => !value)}
          className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-100 transition hover:border-cyan-300/25 hover:text-cyan-200 sm:hidden"
          aria-expanded={open}
          aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        >
          <span className="flex flex-col gap-1.5">
            <span className={`h-0.5 w-5 rounded-full bg-current transition ${open ? "translate-y-2 rotate-45" : ""}`} />
            <span className={`h-0.5 w-5 rounded-full bg-current transition ${open ? "opacity-0" : ""}`} />
            <span className={`h-0.5 w-5 rounded-full bg-current transition ${open ? "-translate-y-2 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      {open ? (
        <div className="border-t border-white/10 bg-slate-950/90 px-4 py-4 shadow-[0_18px_48px_rgba(2,6,23,0.35)] backdrop-blur-xl sm:hidden">
          <nav className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-slate-200">
            {!session && (
              <Link
                href="/"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 hover:border-cyan-300/20 hover:text-cyan-200"
              >
                Home
              </Link>
            )}
            {showForCreators && (
              <Link
                href="/register"
                onClick={() => setOpen(false)}
                className="rounded-2xl border border-white/8 bg-white/5 px-4 py-3 hover:border-cyan-300/20 hover:text-cyan-200"
              >
                For creators
              </Link>
            )}
            <div className="rounded-[20px] border border-white/8 bg-white/5 px-4 py-3">
              <div className="flex flex-col gap-3">
                <HeaderAuth />
              </div>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
