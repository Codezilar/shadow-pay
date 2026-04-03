import Link from "next/link";
import { auth } from "@/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();

  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="relative flex flex-1 flex-col overflow-hidden">
      <section className="relative mx-auto flex max-w-6xl flex-1 flex-col gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-center lg:gap-16">
        <div className="flex-1 space-y-7">
          <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium uppercase tracking-[0.22em] text-cyan-100">
            Built for creators, by creators!
          </p>
          <h1 className="text-4xl font-semibold tracking-[0.05em] text-white sm:text-5xl lg:text-6xl">
            Monetize your audience with <br className="hidden sm:block" />
            branded payment links and community.
          </h1>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-300">
            Paystack-powered payment links, course communities, and engagement 
            tools—all in one seamless experience. Focus on creating while we 
            handle the payments and community.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="sci-button inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Creator sign up
            </Link>
            <Link
              href="/login"
              className="sci-button-secondary inline-flex items-center justify-center rounded-full px-6 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Log in
            </Link>
          </div>
        </div>
        <div className="sci-panel flex flex-1 flex-col gap-6 rounded-[32px] p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-sm font-semibold uppercase tracking-[0.32em] text-cyan-200">How it works</h2>
            <span className="rounded-full border border-fuchsia-300/30 bg-fuchsia-300/10 px-3 py-1 text-[11px] uppercase tracking-[0.22em] text-fuchsia-100">
              Orbit Sequence
            </span>
          </div>
          <ol className="space-y-5 text-sm text-slate-300">
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-xs font-bold text-cyan-100">
                1
              </span>
              <span>Creator registers and chooses a public link slug (e.g. /p/ada-digital).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-xs font-bold text-cyan-100">
                2
              </span>
              <span>Admin approves the profile and sets their % plus optional Paystack split code.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 text-xs font-bold text-cyan-100">
                3
              </span>
              <span>Buyers pay in NGN; webhooks verify success and amounts stay tied to the creator.</span>
            </li>
          </ol>
        </div>
      </section>
    </div>
  );
}
