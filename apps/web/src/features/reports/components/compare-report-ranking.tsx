import type { RegionRankingItem } from "@/features/compare/types";

export function CompareReportRanking({ data }: { data: RegionRankingItem[] }) {
  return (
    <section
      aria-labelledby="report-ranking-title"
      className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
    >
      <h2 id="report-ranking-title" className="text-xl font-semibold text-slate-950">
        같은 조건의 지역 랭킹
      </h2>
      <p className="mt-2 text-sm leading-6 text-slate-600">
        선택한 업종 조건에서 LocalBiz 점수가 높은 지역 일부를 함께 표시합니다.
      </p>
      {data.length > 0 ? (
        <ol className="mt-4 grid gap-3 lg:grid-cols-2">
          {data.map((item) => (
            <li
              key={`${item.rank}-${item.regionLabel}`}
              className="rounded-md border border-slate-100 bg-slate-50 px-4 py-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-slate-950">
                  {item.rank}. {item.regionLabel}
                </p>
                <p className="text-sm font-semibold text-teal-700">
                  {item.localBizScore.toFixed(1)}
                </p>
              </div>
              <p className="mt-2 text-sm text-slate-600">
                관심 업종 {item.categoryStoreCount.toLocaleString("ko-KR")}개 ·
                업종 다양성 {item.categoryDiversityScore.toFixed(1)}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <div className="mt-4 rounded-md bg-slate-50 px-4 py-6 text-sm text-slate-500">
          표시할 지역 랭킹 데이터가 없습니다.
        </div>
      )}
    </section>
  );
}
