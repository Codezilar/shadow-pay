import { auth } from "@/auth";
import { NextResponse } from "next/server";

export default auth((req) => {
  const path = req.nextUrl.pathname;

  if (path.startsWith("/admin")) {
    if (!req.auth) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
    if (req.auth.user?.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
  }

  if (path.startsWith("/dashboard")) {
    if (!req.auth) {
      const url = new URL("/login", req.url);
      url.searchParams.set("callbackUrl", path);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*"],
};
