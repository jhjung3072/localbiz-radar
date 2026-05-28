import { Suspense } from "react";
import { LoginForm } from "@/features/auth/components/login-form";

export default function AdminLoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-12rem)] items-center justify-center py-8">
      <Suspense
        fallback={
          <div className="h-80 w-full max-w-md animate-pulse rounded-[8px] bg-slate-100" />
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  );
}
