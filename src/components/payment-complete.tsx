"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

function PaymentVerifier({ slug, reference }: { slug: string; reference: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
  const [detail, setDetail] = useState<string | null>(null);
  const [communityUrl, setCommunityUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/paystack/verify?reference=${encodeURIComponent(reference)}`);
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string; communityUrl?: string | null };
      if (cancelled) return;
      if (!res.ok) {
        setStatus("fail");
        setDetail(data.error || "Verification failed");
        return;
      }
      setStatus(data.ok ? "ok" : "fail");
      setCommunityUrl(data.communityUrl ?? null);
      if (data.ok && data.communityUrl) {
        window.setTimeout(() => {
          router.push(data.communityUrl!);
        }, 1500);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reference, router]);

  return (
    <div className="sci-panel mx-auto max-w-lg rounded-[30px] p-8 text-center">
      {status === "loading" && <p className="text-sm text-slate-300">Confirming payment…</p>}
      {status === "ok" && (
        <>
          <h1 className="text-lg font-semibold text-emerald-300">Payment successful</h1>
          <p className="mt-2 text-sm text-slate-300">Thank you. Your student access has been provisioned for this course.</p>
          {communityUrl ? (
            <Link
              href={communityUrl}
              className="sci-button mt-5 inline-flex rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
            >
              Enter course community
            </Link>
          ) : null}
        </>
      )}
      {status === "fail" && (
        <>
          <h1 className="text-lg font-semibold text-rose-300">Payment not completed</h1>
          <p className="mt-2 text-sm text-slate-300">{detail || "We could not confirm this charge."}</p>
        </>
      )}
      <Link
        href={`/p/${slug}`}
        className="mt-6 inline-block text-sm font-medium text-cyan-200 hover:text-cyan-100 hover:underline"
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
      <div className="sci-panel mx-auto max-w-lg rounded-[30px] p-8 text-center">
        <h1 className="text-lg font-semibold text-white">No reference</h1>
        <p className="mt-2 text-sm text-slate-400">Return from Paystack was missing a transaction reference.</p>
        <Link
          href={`/p/${slug}`}
          className="mt-6 inline-block text-sm font-medium text-cyan-200 hover:text-cyan-100 hover:underline"
        >
          Back to creator page
        </Link>
      </div>
    );
  }

  return <PaymentVerifier slug={slug} reference={reference} />;
}
