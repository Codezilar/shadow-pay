import Link from "next/link";

export default function AppDownloadPage() {
  const iosUrl = process.env.NEXT_PUBLIC_IOS_APP_URL || "#";
  const androidUrl = process.env.NEXT_PUBLIC_ANDROID_APP_URL || "#";

  return (
    <div className="mx-auto flex max-w-5xl flex-1 flex-col justify-center px-4 py-8 sm:px-6 sm:py-16">
      <div className="sci-panel rounded-[24px] sm:rounded-[34px] p-6 sm:p-8 lg:p-10">
        <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/80">Mobile Download</p>
        <h1 className="mt-4 text-2xl font-semibold tracking-[0.05em] text-white sm:text-3xl lg:text-4xl">
          NexaPay Mobile App Coming Soon
        </h1>
        <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base sm:leading-7">
          The native mobile app for creator operations, course communities, and faster mobile navigation is currently in development. We'll update this page when the app becomes available for download on iOS and Android.
        </p>

        <div className="mt-6 grid gap-4 sm:mt-8 sm:grid-cols-2">
          <a
            href={iosUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-[20px] sm:rounded-[26px] border border-cyan-300/18 bg-cyan-300/8 p-4 shadow-[0_8px_20px_rgba(2,6,23,0.24)] sm:p-5 sm:shadow-[0_16px_40px_rgba(2,6,23,0.24)]"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-200/70">iOS</p>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Coming Soon on the App Store</h2>
            <p className="mt-3 text-sm leading-5 text-slate-300 sm:leading-6">The native iPhone/iPad app is in development and will be available soon.</p>
          </a>

          <a
            href={androidUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-[20px] sm:rounded-[26px] border border-fuchsia-300/18 bg-fuchsia-300/8 p-4 shadow-[0_8px_20px_rgba(2,6,23,0.24)] sm:p-5 sm:shadow-[0_16px_40px_rgba(2,6,23,0.24)]"
          >
            <p className="text-[11px] uppercase tracking-[0.22em] text-fuchsia-200/70">Android</p>
            <h2 className="mt-3 text-xl font-semibold text-white sm:text-2xl">Coming Soon on Google Play</h2>
            <p className="mt-3 text-sm leading-5 text-slate-300 sm:leading-6">The Android app is in development and will be available soon.</p>
          </a>
        </div>

        <div className="mt-6 rounded-[20px] sm:rounded-[26px] border border-white/10 bg-white/[0.04] p-4 sm:mt-8 sm:p-5">
          <p className="text-sm font-semibold text-white">App Not Available Yet</p>
          <p className="mt-2 text-sm leading-5 text-slate-400 sm:leading-6">
            The NexaPay mobile app is currently in development. We'll update this page with download links and set the environment variables `NEXT_PUBLIC_IOS_APP_URL` and `NEXT_PUBLIC_ANDROID_APP_URL` when the app is ready for release.
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
