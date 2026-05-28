"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { login } from "@/features/auth/api/auth-api";
import { authQueryKeys } from "@/features/auth/api/auth-query-keys";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const setUser = useAuthStore((state) => state.setUser);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const loginMutation = useMutation({
    mutationFn: login,
    onSuccess: async (response) => {
      setUser(response.user);
      await queryClient.invalidateQueries({ queryKey: authQueryKeys.all });
      router.replace(resolveNextPath(searchParams.get("next")));
    },
    onError: (error) => {
      setMessage(
        error instanceof Error
          ? error.message
          : "로그인에 실패했습니다.",
      );
    },
  });

  return (
    <form
      className="mx-auto w-full max-w-md rounded-[8px] border border-slate-200 bg-white p-6 shadow-sm"
      onSubmit={(event) => {
        event.preventDefault();
        setMessage(null);
        loginMutation.mutate({ username, password });
      }}
    >
      <div className="mb-6 flex items-center gap-3">
        <span className="flex size-10 items-center justify-center rounded-md bg-teal-600 text-white">
          <LockKeyhole className="size-5" aria-hidden="true" />
        </span>
        <div>
          <h1 className="text-2xl font-semibold tracking-normal text-slate-950">
            관리자 로그인
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            데이터 동기화 기능은 관리자만 사용할 수 있습니다.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="username"
            className="text-sm font-medium text-slate-800"
          >
            아이디
          </label>
          <input
            id="username"
            name="username"
            autoComplete="username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-3 focus:ring-teal-500/20"
            required
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="text-sm font-medium text-slate-800"
          >
            비밀번호
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 h-11 w-full rounded-md border border-slate-300 bg-white px-3 text-sm text-slate-950 outline-none transition focus:border-teal-600 focus:ring-3 focus:ring-teal-500/20"
            required
          />
        </div>
      </div>

      {message ? (
        <p role="alert" className="mt-4 text-sm font-medium text-rose-700">
          {message}
        </p>
      ) : null}

      <Button
        type="submit"
        className="mt-6 w-full"
        disabled={loginMutation.isPending}
      >
        {loginMutation.isPending ? "로그인 중" : "로그인"}
      </Button>

      <p className="mt-4 text-center text-xs leading-5 text-slate-500">
        로그인 후 데이터 동기화 화면으로 이동합니다.
      </p>
    </form>
  );
}

function resolveNextPath(next: string | null) {
  if (next && next.startsWith("/") && !next.startsWith("//")) {
    return next;
  }

  return "/data-sync";
}
