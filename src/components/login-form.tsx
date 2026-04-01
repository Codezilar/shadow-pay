"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Invalid email or password.");
      return;
    }
    router.push(callbackUrl);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Welcome back</h1>
        <p className="mt-1 text-sm text-zinc-500">Sign in to manage your creator profile and payouts.</p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Password</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="mt-2 rounded-xl bg-emerald-600 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
