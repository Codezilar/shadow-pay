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
        <div className="flex-1 space-y-6">
          <p className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
            Built for Nigeria · Paystack · NGN
          </p>
          <h1 className="text-4xl font-semibold tracking-tight text-zinc-900 sm:text-5xl dark:text-zinc-50">
            Partner with creators. Split every sale automatically.
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-zinc-600 dark:text-zinc-400">
            Creators get a branded payment link. You set each creator&apos;s revenue share in admin. Checkout runs on
            Paystack with card, bank transfer, USSD, and more—while your platform keeps a clear audit trail.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500"
            >
              Creator sign up
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded-xl border border-zinc-300 bg-white px-5 py-2.5 text-sm font-semibold text-zinc-900 hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-950 dark:text-zinc-50 dark:hover:bg-zinc-900"
            >
              Log in
            </Link>
          </div>
        </div>
        <div className="flex flex-1 flex-col gap-4 rounded-3xl border border-zinc-200 bg-white/80 p-6 shadow-sm backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/80">
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">How it works</h2>
          <ol className="space-y-4 text-sm text-zinc-600 dark:text-zinc-400">
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                1
              </span>
              <span>Creator registers and chooses a public link slug (e.g. /p/ada-digital).</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                2
              </span>
              <span>Admin approves the profile and sets their % plus optional Paystack split code.</span>
            </li>
            <li className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
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
