import Link from "next/link";

export default function AppDownloadPage() {
  const iosUrl = process.env.NEXT_PUBLIC_IOS_APP_URL || "#";
  const androidUrl = process.env.NEXT_PUBLIC_ANDROID_APP_URL || "#";

  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-12 sm:px-6 sm:py-16">
      <div className="sci-panel rounded-[34px] p-8 sm:p-10">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Mobile Download</p>
        <h1 className="mt-4 text-3xl font-semibold tracking-[0.05em] text-white sm:text-4xl">
          Install NexaPay Mobile for iOS and Android
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
          Use the native mobile app for creator operations, course communities, and faster mobile navigation. Update the
          environment links when your App Store and Play Store URLs are ready.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <a
            href={iosUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-[26px] border border-cyan-300/18 bg-cyan-300/8 p-5 shadow-[0_16px_40px_rgba(2,6,23,0.24)]"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">iOS</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Download on the App Store</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Install the native iPhone/iPad build when your listing is published.</p>
          </a>

          <a
            href={androidUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-[26px] border border-fuchsia-300/18 bg-fuchsia-300/8 p-5 shadow-[0_16px_40px_rgba(2,6,23,0.24)]"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-200/70">Android</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Get it on Google Play</h2>
            <p className="mt-3 text-sm leading-6 text-slate-300">Install the Android build or connect a direct APK/testing link later.</p>
          </a>
        </div>

        <div className="mt-8 rounded-[26px] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm font-semibold text-white">Need to wire your store links?</p>
          <p className="mt-2 text-sm leading-6 text-slate-400">
            Set `NEXT_PUBLIC_IOS_APP_URL` and `NEXT_PUBLIC_ANDROID_APP_URL` in your environment so both the website and
            the mobile prompt know where to send users.
          </p>
          <Link
            href="/"
            className="mt-4 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-200"
          >
            Back to site
          </Link>
        </div>
      </div>
    </div>
  );
}
