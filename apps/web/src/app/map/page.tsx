import { Suspense } from "react";
import { StoreMap } from "@/features/map/components/store-map";
import { getExploreBootstrap } from "@/features/explore/server/get-explore-bootstrap";

export default async function MapPage() {
  const initialData = await getExploreBootstrap().catch(() => null);

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">지도 기반 점포 분포</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            지도 기반 점포 분포
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            개발용 seed data의 점포 위치를 Kakao Maps 위에서 확인하고, 현재
            지도 중심 기준 반경 검색으로 주변 점포를 탐색합니다.
          </p>
        </div>
      </section>

      <Suspense
        fallback={<MapPageSkeleton />}
      >
        <StoreMap initialData={initialData} />
      </Suspense>
    </div>
  );
}

function MapPageSkeleton() {
  return (
    <div className="grid gap-5 xl:grid-cols-[320px_minmax(0,1fr)]">
      <div className="space-y-4">
        <div className="h-[620px] animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
        <div className="h-11 animate-pulse rounded-md border border-slate-200 bg-slate-100" />
        <div className="h-44 animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
      </div>
      <div className="space-y-4">
        <div className="h-[520px] animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="h-[430px] animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
          <div className="h-[430px] animate-pulse rounded-[8px] border border-slate-200 bg-slate-100" />
        </div>
      </div>
    </div>
  );
}
