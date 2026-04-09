"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

function PaymentVerifier({ slug, reference }: { slug: string; reference: string }) {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "fail">("loading");
  const [detail, setDetail] = useState<string | null>(null);
  const [communityUrl, setCommunityUrl] = useState<string | null>(null);
  const [loginUrl, setLoginUrl] = useState<string | null>(null);

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
        let credentials: { email?: string; password?: string } | null = null;
        const stored = sessionStorage.getItem(`paystack:return:${reference}`);
        if (stored) {
          try {
            credentials = JSON.parse(stored) as { email?: string; password?: string };
          } catch {
            credentials = null;
          }
        }
        const callbackUrl = data.communityUrl;

        if (credentials?.email && credentials.password) {
          const signInResult = await signIn("credentials", {
            email: credentials.email,
            password: credentials.password,
            redirect: false,
          });

          sessionStorage.removeItem(`paystack:return:${reference}`);

          if (!signInResult?.error) {
            window.setTimeout(() => {
              router.push(callbackUrl);
              router.refresh();
            }, 800);
            return;
          }
        }

        setDetail("Payment succeeded, but we could not create your session automatically. Log in to enter your course community.");
        setLoginUrl(`/login?callbackUrl=${encodeURIComponent(callbackUrl)}`);
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
          <p className="mt-2 text-sm text-slate-300">
            {detail || "Thank you. Your student access has been provisioned for this course and your community is loading now."}
          </p>
          {communityUrl ? (
            <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
              <Link
                href={communityUrl}
                className="sci-button inline-flex rounded-full px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em]"
              >
                Enter course community
              </Link>
              {loginUrl ? (
                <Link
                  href={loginUrl}
                  className="rounded-full border border-white/10 px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-slate-200 hover:border-cyan-300/40 hover:text-cyan-100"
                >
                  Log in first
                </Link>
              ) : null}
            </div>
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
