"use client";

import Link from "next/link";
import { useMemo, useState, useSyncExternalStore } from "react";

function isMobileUserAgent(ua: string) {
  return /android|iphone|ipad|ipod|mobile/i.test(ua);
}

function getDeviceSnapshot() {
  const ua = window.navigator.userAgent || "";
  const visible = isMobileUserAgent(ua) || window.innerWidth < 768;
  const platform = /iphone|ipad|ipod/i.test(ua) ? "ios" : /android/i.test(ua) ? "android" : "other";
  const storedDismissed = window.localStorage.getItem("nexapay-mobile-prompt-dismissed") === "1";

  return JSON.stringify({ visible, platform, storedDismissed });
}

export function MobileAppPrompt() {
  const [dismissed, setDismissed] = useState(false);
  const deviceStateSnapshot = useSyncExternalStore(
    (callback) => {
      window.addEventListener("resize", callback);
      return () => window.removeEventListener("resize", callback);
    },
    getDeviceSnapshot,
    () => JSON.stringify({ visible: false, platform: "other", storedDismissed: false })
  );
  const deviceState = useMemo(
    () => JSON.parse(deviceStateSnapshot) as { visible: boolean; platform: "ios" | "android" | "other"; storedDismissed: boolean },
    [deviceStateSnapshot]
  );

  const href = useMemo(() => {
    const iosUrl = process.env.NEXT_PUBLIC_IOS_APP_URL;
    const androidUrl = process.env.NEXT_PUBLIC_ANDROID_APP_URL;

    if (deviceState.platform === "ios" && iosUrl) return iosUrl;
    if (deviceState.platform === "android" && androidUrl) return androidUrl;
    return "/app-download";
  }, [deviceState.platform]);

  if (!deviceState.visible || dismissed || deviceState.storedDismissed) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(320px,calc(100vw-2rem))] sm:hidden">
      <div className="relative overflow-hidden rounded-[24px] border border-cyan-300/18 bg-[linear-gradient(180deg,rgba(8,13,31,0.96)_0%,rgba(5,9,22,0.98)_100%)] p-4 shadow-[0_25px_70px_rgba(2,6,23,0.5)] backdrop-blur-xl">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(217,70,239,0.14),transparent_24%)]" />
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setDismissed(true);
              window.localStorage.setItem("nexapay-mobile-prompt-dismissed", "1");
            }}
            className="absolute right-0 top-0 text-slate-500"
            aria-label="Dismiss app download prompt"
          >
            ×
          </button>

          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-cyan-200/80">Get the app</p>
          <h2 className="mt-2 text-base font-semibold text-white">Install NexaPay Mobile</h2>
          <p className="mt-2 text-sm leading-6 text-slate-300">
            Download the iOS or Android app for a faster creator and community experience.
          </p>

          <Link
            href={href}
            className="mt-4 inline-flex w-full items-center justify-center rounded-full border border-cyan-300/35 bg-cyan-300/10 px-4 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-cyan-100"
          >
            Download app
          </Link>
        </div>
      </div>
    </div>
  );
}
