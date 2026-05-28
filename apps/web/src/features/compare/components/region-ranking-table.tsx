import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { RegionRankingItem } from "@/features/compare/types";

type RegionRankingTableProps = {
  data?: RegionRankingItem[];
  isLoading: boolean;
  isError: boolean;
  onSelectTarget: (item: RegionRankingItem) => void;
};

export function RegionRankingTable({
  data,
  isLoading,
  isError,
  onSelectTarget,
}: RegionRankingTableProps) {
  const items = data ?? [];

  return (
    <section className="overflow-hidden rounded-[8px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <h2 className="text-lg font-semibold text-slate-950">추천 후보 지역 랭킹</h2>
        <p className="mt-2 text-sm text-slate-600">
          선택 업종 기준으로 LocalBiz 점수가 높은 지역을 정렬합니다.
        </p>
      </div>
      {isError ? (
        <div role="alert" className="m-4 rounded-md bg-rose-50 p-4 text-sm text-rose-800">
          지역 랭킹을 불러오지 못했습니다.
        </div>
      ) : null}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">순위</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">지역</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">LocalBiz</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">선택 업종</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">경쟁 강도</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">업종 다양성</th>
              <th className="border-b border-slate-200 px-4 py-3 font-semibold">선택</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading ? (
              <LoadingRows />
            ) : items.length > 0 ? (
              items.map((item) => (
                <tr key={`${item.rank}-${item.regionLabel}`} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-semibold text-slate-950">{item.rank}</td>
                  <td className="px-4 py-3 text-slate-700">{item.regionLabel}</td>
                  <td className="px-4 py-3 font-semibold text-teal-700">
                    {item.localBizScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.categoryStoreCount.toLocaleString("ko-KR")}개
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.competitionIndex.toFixed(1)}
                  </td>
                  <td className="px-4 py-3 text-slate-700">
                    {item.categoryDiversityScore.toFixed(1)}
                  </td>
                  <td className="px-4 py-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTarget(item)}
                    >
                      비교 지역
                      <ArrowRight className="size-4" aria-hidden="true" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-4 py-12 text-center text-sm text-slate-500">
                  추천 후보 지역 데이터가 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function LoadingRows() {
  return (
    <>
      {Array.from({ length: 4 }).map((_, rowIndex) => (
        <tr key={rowIndex}>
          {Array.from({ length: 7 }).map((__, columnIndex) => (
            <td key={`${rowIndex}-${columnIndex}`} className="px-4 py-3">
              <div className="h-4 w-full max-w-28 animate-pulse rounded bg-slate-100" />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
