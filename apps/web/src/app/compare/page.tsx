import { Suspense } from "react";
import { ComparePageClient } from "@/features/compare/components/compare-page-client";

export default function ComparePage() {
  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
      }
    >
      <ComparePageClient />
    </Suspense>
  );
}
