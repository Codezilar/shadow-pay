import type { Metadata } from "next";
import { MobileAppPrompt } from "@/components/mobile-app-prompt";
import { Providers } from "@/components/providers";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "NexaPay NG — Creator payouts & Paystack splits",
  description:
    "Nigerian creator platform: sign up, personal payment links, and agreement-based revenue share with Paystack.",
  icons: {
    icon: "/nexapay.png",
    shortcut: "/nexapay.png",
    apple: "/nexapay.png",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="app-shell min-h-full flex flex-col text-slate-50">
        <Providers>
          <SiteHeader />
          <main className="relative flex flex-1 flex-col">{children}</main>
          <MobileAppPrompt />
        </Providers>
      </body>
    </html>
  );
}
