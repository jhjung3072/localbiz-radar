import type { CompareAreaResult } from "@/features/compare/types";

export function TopCategoryComparison({
  base,
  target,
}: {
  base: CompareAreaResult;
  target: CompareAreaResult;
}) {
  return (
    <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-950">상위 업종 비교</h2>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <TopCategoryList title={base.regionLabel} items={base.topCategories} />
        <TopCategoryList title={target.regionLabel} items={target.topCategories} />
      </div>
    </article>
  );
}

function TopCategoryList({
  title,
  items,
}: {
  title: string;
  items: CompareAreaResult["topCategories"];
}) {
  return (
    <div className="rounded-md bg-slate-50 p-4">
      <h3 className="font-semibold text-slate-950">{title}</h3>
      {items.length > 0 ? (
        <ol className="mt-3 space-y-2">
          {items.map((item, index) => (
            <li
              key={item.categoryCode}
              className="flex items-center justify-between gap-3 text-sm"
            >
              <span className="truncate text-slate-700">
                {index + 1}. {item.categoryName}
              </span>
              <span className="shrink-0 font-semibold text-slate-950">
                {item.storeCount.toLocaleString("ko-KR")}개 · {item.ratio.toFixed(1)}%
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="mt-3 text-sm text-slate-500">업종 데이터가 없습니다.</p>
      )}
    </div>
  );
}
