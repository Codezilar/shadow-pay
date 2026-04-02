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
      className="sci-panel flex w-full max-w-md flex-col gap-4 rounded-[30px] p-8"
    >
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/80">Creator Onboarding</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-[0.05em] text-white">Apply as a creator</h1>
        <p className="mt-2 text-sm text-slate-400">
          Create your account. An admin will approve your profile before your payment link goes live.
        </p>
      </div>
      {error && (
        <p className="rounded-2xl border border-rose-400/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-200" role="alert">
          {error}
        </p>
      )}
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-200">Public display name</span>
        <input
          required
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="sci-input rounded-2xl px-4 py-3"
        />
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-200">Payment link slug</span>
        <input
          required
          placeholder="e.g. ada-digital"
          value={slug}
          onChange={(e) => setSlug(e.target.value.toLowerCase())}
          className="sci-input rounded-2xl px-4 py-3 font-mono text-sm"
        />
        <span className="text-xs text-slate-500">Your link: /p/{slug || "your-slug"}</span>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-slate-200">Your name (optional)</span>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="sci-input rounded-2xl px-4 py-3"
        />
      </label>
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
        <span className="font-medium text-slate-200">Password (min 8 characters)</span>
        <input
          required
          minLength={8}
          type="password"
          autoComplete="new-password"
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
        {loading ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-cyan-200 hover:text-cyan-100 hover:underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
