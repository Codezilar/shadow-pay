"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [slug, setSlug] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, name: name || undefined, displayName, slug }),
    });
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    setLoading(false);
    if (!res.ok) {
      setError(data.error || "Registration failed");
      return;
    }
    const sign = await signIn("credentials", { email, password, redirect: false });
    if (sign?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex w-full max-w-md flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-950"
    >
      <div>
        <h1 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">Apply as a creator</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Create your account. An admin will approve your profile before your payment link goes live.
        </p>
      </div>
      {error && (
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300" role="alert">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Public display name</span>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Payment link slug</span>
        <input
          required
          placeholder="e.g. ada-digital"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 font-mono text-sm text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
        <span className="text-xs text-zinc-500">Your link: /p/{slug || "your-slug"}</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Your name (optional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-zinc-900 outline-none ring-emerald-500/30 focus:border-emerald-500 focus:ring-4 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
        />
      </label>
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
        <span className="font-medium text-zinc-700 dark:text-zinc-300">Password (min 8 characters)</span>
        <input
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
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
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Log in
        </Link>
      </p>
    </form>
  );
}
