import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      role: "ADMIN" | "CREATOR" | "STUDENT";
    };
  }

  interface User {
    role: "ADMIN" | "CREATOR" | "STUDENT";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: "ADMIN" | "CREATOR" | "STUDENT";
  }
}
