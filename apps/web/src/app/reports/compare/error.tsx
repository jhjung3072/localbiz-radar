"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function CompareReportError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: {
        category: "report",
        failureType: "compare_report_error_boundary",
      },
    });
  }, [error]);

  return (
    <section
      role="alert"
      className="mx-auto max-w-3xl rounded-[8px] border border-rose-200 bg-rose-50 p-6 text-rose-900"
    >
      <h1 className="text-2xl font-semibold">리포트를 표시하지 못했습니다</h1>
      <p className="mt-3 text-sm leading-6">
        공유 링크의 조건이나 API 서버 상태를 확인한 뒤 다시 시도해 주세요.
      </p>
      <Button type="button" className="mt-5" onClick={reset}>
        다시 시도
      </Button>
    </section>
  );
}
