"use client";

import { useEffect, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getMe } from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-query-keys";
import { useAuthStore } from "@/features/auth/store/auth-store";

type AdminGuardProps = {
  children: ReactNode;
};

export function AdminGuard({ children }: AdminGuardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);
  const setChecking = useAuthStore((state) => state.setChecking);

  const meQuery = useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    setChecking(meQuery.isLoading);
  }, [meQuery.isLoading, setChecking]);

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
  }, [meQuery.data, setUser]);

  useEffect(() => {
    if (!meQuery.isError) {
      return;
    }

    clearUser();
    const query = searchParams.toString();
    const next = `${pathname}${query ? `?${query}` : ""}`;
    router.replace(`/admin/login?next=${encodeURIComponent(next)}`);
  }, [clearUser, meQuery.isError, pathname, router, searchParams]);

  if (meQuery.isLoading) {
    return (
      <div className="space-y-4" aria-live="polite" aria-busy="true">
        <div className="h-8 w-56 animate-pulse rounded bg-slate-200" />
        <div className="h-32 animate-pulse rounded-[8px] bg-slate-100" />
        <div className="h-64 animate-pulse rounded-[8px] bg-slate-100" />
      </div>
    );
  }

  if (meQuery.isError) {
    return null;
  }

  return children;
}
