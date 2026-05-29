import { Suspense } from "react";
import { ComparePageClient } from "@/features/compare/components/compare-page-client";
import { getCompareBootstrap } from "@/features/compare/server/get-compare-bootstrap";

type ComparePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const params = await searchParams;
  const initialData = await getCompareBootstrap({
    ctprvnCd: getParam(params, "baseCtprvnCd") ?? getParam(params, "ctprvnCd"),
    groupBy: "SIGUNGU",
    indsLclsCd: getParam(params, "large") ?? getParam(params, "indsLclsCd"),
    indsMclsCd: getParam(params, "medium") ?? getParam(params, "indsMclsCd"),
    indsSclsCd: getParam(params, "small") ?? getParam(params, "indsSclsCd"),
    limit: 10,
  }).catch(() => null);

  return (
    <Suspense
      fallback={
        <div className="h-96 animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
      }
    >
      <ComparePageClient initialData={initialData} />
    </Suspense>
  );
}

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}
