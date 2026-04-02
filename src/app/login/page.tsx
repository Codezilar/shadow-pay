import { Suspense } from "react";
import { LoginForm } from "@/components/login-form";

export default function LoginPage() {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <Suspense fallback={<p className="text-sm text-slate-400">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
