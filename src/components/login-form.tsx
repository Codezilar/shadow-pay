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
    <form onSubmit={onSubmit} className="sci-panel flex w-full max-w-md flex-col gap-4 rounded-[30px] p-8">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Command Access</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[0.05em] text-white">Welcome back</h1>
        <p className="mt-2 text-sm text-slate-400">Sign in to manage your creator profile and payouts.</p>
      </div>
      {error && (
        <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-200">Email</span>
        <input
          required
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="sci-input rounded-2xl px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-200">Password</span>
        <input
          required
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="sci-input rounded-2xl px-4 py-3"
        />
      </label>
      <button
        type="submit"
        disabled={loading}
        className="sci-button mt-2 rounded-full py-3 text-sm font-semibold uppercase tracking-[0.18em] disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
