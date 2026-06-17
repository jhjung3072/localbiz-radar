"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Copy, FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { CompareReportData } from "@/features/reports/types";
import { addSafeBreadcrumb } from "@/lib/sentry-utils";

type CompareReportActionsProps = {
  report: Pick<CompareReportData, "compareUrl" | "reportUrl">;
};

export function CompareReportActions({ report }: CompareReportActionsProps) {
  const [message, setMessage] = useState("");
  const sharePath = report.reportUrl;
  const shareUrl = useMemo(() => {
    if (typeof window === "undefined") {
      return sharePath;
    }
    return new URL(sharePath, window.location.origin).toString();
  }, [sharePath]);

  async function handleCopy() {
    addSafeBreadcrumb("report", "공유 리포트 링크 복사", {
      hasReportUrl: Boolean(sharePath),
    });
    try {
      await navigator.clipboard.writeText(shareUrl);
      setMessage("공유 링크를 복사했습니다.");
    } catch {
      setMessage("링크를 복사하지 못했습니다. 주소창의 URL을 직접 복사해 주세요.");
    }
  }

  function handlePrint() {
    addSafeBreadcrumb("report", "공유 리포트 인쇄 실행");
    window.print();
  }

  return (
    <div className="report-actions flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
      <div aria-live="polite" className="min-h-5 text-sm text-teal-700">
        {message}
      </div>
      <Button type="button" variant="outline" onClick={handleCopy}>
        <Copy className="size-4" aria-hidden="true" />
        공유 링크 복사
      </Button>
      <Button type="button" variant="outline" onClick={handlePrint}>
        <Printer className="size-4" aria-hidden="true" />
        인쇄하기
      </Button>
      <Button asChild>
        <Link href={report.compareUrl}>
          <FileText className="size-4" aria-hidden="true" />
          비교 화면으로 돌아가기
        </Link>
      </Button>
    </div>
  );
}
