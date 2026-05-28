"use client";

import { useState } from "react";
import * as Sentry from "@sentry/nextjs";
import { Button } from "@/components/ui/button";

export default function SentryTestPage() {
  const [shouldThrow, setShouldThrow] = useState(false);
  const isProduction = process.env.NODE_ENV === "production";

  if (shouldThrow) {
    throw new Error("Sentry frontend test error");
  }

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">개발용 진단</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            Sentry 테스트
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            프론트엔드 에러 수집, 수동 capture, breadcrumb 기록을 로컬에서
            확인하는 개발용 페이지입니다.
          </p>
        </div>
      </section>

      {isProduction ? (
        <section className="rounded-[8px] border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-900">
          production 환경에서는 테스트 에러 발생 버튼을 제공하지 않습니다.
        </section>
      ) : (
        <section className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-xl font-semibold text-slate-950">테스트 실행</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            실제 Sentry 전송 여부는 DSN 설정에 따라 달라집니다. DSN이 없으면
            UI와 로컬 동작만 확인할 수 있습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Button type="button" onClick={() => setShouldThrow(true)}>
              클라이언트 에러 발생
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                Sentry.captureException(new Error("Sentry manual capture test"));
              }}
            >
              수동 captureException 테스트
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                Sentry.addBreadcrumb({
                  category: "sentry-test",
                  message: "breadcrumb 테스트 버튼 클릭",
                  level: "info",
                });
                setShouldThrow(true);
              }}
            >
              breadcrumb 테스트
            </Button>
          </div>
        </section>
      )}
    </div>
  );
}
