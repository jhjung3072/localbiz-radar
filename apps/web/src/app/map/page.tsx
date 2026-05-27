import { StoreMap } from "@/features/map/components/store-map";

export default function MapPage() {
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

      <StoreMap />
    </div>
  );
}
