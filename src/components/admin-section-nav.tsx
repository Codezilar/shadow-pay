"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const adminLinks = [
  { href: "/admin", label: "Creators", description: "Profiles, payouts, withdrawals" },
  { href: "/admin/communities", label: "Communities", description: "Jump into creator course rooms" },
  { href: "/admin/withdrawals", label: "Withdrawals", description: "Approve and complete payout requests" },
];

export function AdminSectionNav() {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div className="rounded-[24px] border border-white/10 bg-slate-950/45 p-3 shadow-[0_20px_60px_rgba(5,10,30,0.35),inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
        <div className="flex flex-col gap-3 sm:flex-row">
          {adminLinks.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex-1 rounded-[18px] border px-4 py-3 transition ${
                  active
                    ? "border-cyan-300/35 bg-cyan-300/12 shadow-[0_0_24px_rgba(34,211,238,0.14)]"
                    : "border-white/0 bg-white/4 hover:border-white/10 hover:bg-white/8"
                }`}
              >
                <p className={`text-sm font-semibold ${active ? "text-cyan-100" : "text-slate-100"}`}>{link.label}</p>
                <p className="mt-1 text-xs text-slate-400">{link.description}</p>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
