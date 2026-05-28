"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="ko">
      <body className="min-h-screen bg-slate-50 text-slate-950">
        <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center px-6 py-16">
          <p className="text-sm font-semibold text-rose-700">오류가 발생했습니다</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-normal">
            화면을 표시하지 못했습니다
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-600">
            예상하지 못한 문제가 발생했습니다. 오류 정보는 프론트엔드 에러
            모니터링으로 전송되며, 인증 cookie나 token 값은 포함하지 않습니다.
          </p>
          {error.digest ? (
            <p className="mt-3 font-mono text-xs text-slate-500">
              오류 식별자: {error.digest}
            </p>
          ) : null}
          <div className="mt-8 flex flex-wrap gap-3">
            <Button type="button" onClick={reset}>
              다시 시도
            </Button>
            <Button asChild type="button" variant="outline">
              <Link href="/">홈으로 이동</Link>
            </Button>
          </div>
        </main>
      </body>
    </html>
  );
}
