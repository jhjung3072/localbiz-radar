"use client";

import Link from "next/link";
import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, DatabaseZap, LogOut, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getMe, logout } from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-query-keys";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function AuthStatusButton() {
  const router = useRouter();
  const pathname = usePathname() ?? "/";
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const clearUser = useAuthStore((state) => state.clearUser);

  const meQuery = useQuery({
    queryKey: authQueryKeys.me(),
    queryFn: getMe,
    retry: false,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (meQuery.data) {
      setUser(meQuery.data);
    }
    if (meQuery.isError) {
      clearUser();
    }
  }, [clearUser, meQuery.data, meQuery.isError, setUser]);

  const logoutMutation = useMutation({
    mutationFn: logout,
    onSettled: async () => {
      clearUser();
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      if (pathname.startsWith("/data-sync") || pathname.startsWith("/admin/ops")) {
        router.replace(`/admin/login?next=${encodeURIComponent(pathname)}`);
      }
    },
  });

  if (user) {
    return (
      <div className="flex min-w-max flex-wrap items-center gap-2">
        <span className="inline-flex h-9 items-center gap-2 rounded-md border border-teal-200 bg-teal-50 px-3 text-sm font-medium text-teal-800">
          <ShieldCheck className="size-4" aria-hidden="true" />
          관리자
        </span>
        <Link
          href="/admin/ops"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-teal-300 hover:text-teal-800 focus-visible:ring-3 focus-visible:ring-teal-500/30"
        >
          <Activity className="size-4" aria-hidden="true" />
          운영 대시보드
        </Link>
        <Link
          href="/data-sync"
          className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-teal-300 hover:text-teal-800 focus-visible:ring-3 focus-visible:ring-teal-500/30"
        >
          <DatabaseZap className="size-4" aria-hidden="true" />
          데이터 동기화
        </Link>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="size-4" aria-hidden="true" />
          로그아웃
        </Button>
      </div>
    );
  }

  return (
    <Link
      href="/admin/login?next=/data-sync"
      className="inline-flex h-9 min-w-max items-center gap-2 rounded-md border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none transition hover:border-teal-300 hover:text-teal-800 focus-visible:ring-3 focus-visible:ring-teal-500/30"
    >
      <ShieldCheck className="size-4" aria-hidden="true" />
      관리자 로그인
    </Link>
  );
}
