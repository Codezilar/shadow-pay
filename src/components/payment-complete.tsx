"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function PaymentVerifier({ slug, reference }: { slug: string; reference: string }) {
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
  const [detail, setDetail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`);
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (cancelled) return;
      if (!res.ok) {
        setStatus("fail");
        setDetail(data.error || "Verification failed");
        return;
      }
      setStatus(data.ok ? "ok" : "fail");
    })();
    return () => {
      cancelled = true;
    };
  }, [reference]);

  return (
    <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      {status === "loading" && <p className="text-sm text-zinc-600 dark:text-zinc-400">Confirming payment…</p>}
      {status === "ok" && (
        <>
          <h1 className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">Payment successful</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">Thank you. The creator has been notified via our records.</p>
        </>
      )}
      {status === "fail" && (
        <>
          <h1 className="text-lg font-semibold text-red-700 dark:text-red-400">Payment not completed</h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{detail || "We could not confirm this charge."}</p>
        </>
      )}
      <Link
        href={`/p/${slug}`}
        className="mt-6 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
      >
        Back to creator page
      </Link>
    </div>
  );
}

export function PaymentComplete({ slug }: { slug: string }) {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference") || searchParams.get("trxref");

  if (!reference) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-zinc-200 bg-white p-8 text-center shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">No reference</h1>
        <p className="mt-2 text-sm text-zinc-500">Return from Paystack was missing a transaction reference.</p>
        <Link
          href={`/p/${slug}`}
          className="mt-6 inline-block text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          Back to creator page
        </Link>
      </div>
    );
  }

  return <PaymentVerifier slug={slug} reference={reference} />;
}
