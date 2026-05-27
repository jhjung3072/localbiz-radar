import { AlertTriangle, ListOrdered, MapPinned, Store, Tags, TrendingUp } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { StatusPlaceholder } from "@/components/common/status-placeholder";
import { CategoryDistributionChart } from "@/features/dashboard/category-distribution-chart";
import {
  categoryDistribution,
  popularCategories,
} from "@/features/dashboard/mock-dashboard";
import { formatCompactNumber } from "@/lib/format";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">목업 대시보드</p>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
              지역 상권 대시보드
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
              현재 화면은 실제 API 연동 전 단계의 정적 예시입니다. 데이터 구조와
              사용자 흐름을 검증하기 위한 목업 값만 사용합니다.
            </p>
          </div>
          <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-800">
            실시간 데이터 아님
          </div>
        </div>
      </section>

      <section
        aria-label="상권 요약 지표"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="총 점포 수"
          value={formatCompactNumber(12800)}
          description="선택 지역의 추정 상가 수"
          icon={<Store className="size-5" />}
          accent="teal"
        />
        <MetricCard
          title="활성 업종 수"
          value="42개"
          description="대분류 기준 활성 카테고리"
          icon={<Tags className="size-5" />}
          accent="indigo"
        />
        <MetricCard
          title="선택 지역"
          value="서울 마포구"
          description="초기 목업 기준 지역"
          icon={<MapPinned className="size-5" />}
          accent="amber"
        />
        <MetricCard
          title="경쟁 지수"
          value="78.4"
          description="100점 기준 목업 점수"
          icon={<TrendingUp className="size-5" />}
          accent="rose"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.9fr]">
        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">
                업종별 점포 분포
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                선택 지역 내 주요 업종의 점포 수 예시
              </p>
            </div>
            <BarChart3Icon />
          </div>
          <CategoryDistributionChart data={categoryDistribution} />
        </article>

        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <ListOrdered className="size-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-950">
              인기 업종 순위
            </h2>
          </div>
          <ol className="space-y-3">
            {popularCategories.map((category) => (
              <li
                key={category.name}
                className="flex items-center justify-between gap-3 rounded-md bg-slate-50 px-3 py-3"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-7 items-center justify-center rounded-md bg-white text-sm font-semibold text-slate-700 ring-1 ring-slate-200">
                    {category.rank}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-slate-950">
                      {category.name}
                    </p>
                    <p className="text-xs text-slate-500">
                      {category.count.toLocaleString("ko-KR")}개 점포
                    </p>
                  </div>
                </div>
                <span className="text-sm font-medium text-teal-700">
                  {category.trend}
                </span>
              </li>
            ))}
          </ol>
        </article>
      </section>

      <section aria-labelledby="state-title" className="space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="size-5 text-slate-600" aria-hidden="true" />
          <h2 id="state-title" className="text-xl font-semibold text-slate-950">
            상태 UI 예시
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <StatusPlaceholder
            type="loading"
            title="불러오는 중"
            description="공공 데이터 동기화 또는 백엔드 응답 대기 상태에 사용할 예시입니다."
          />
          <StatusPlaceholder
            type="empty"
            title="결과 없음"
            description="검색 조건에 맞는 상가 데이터가 없을 때 보여줄 수 있습니다."
          />
          <StatusPlaceholder
            type="error"
            title="오류 발생"
            description="백엔드 프록시 또는 네트워크 오류 안내에 사용할 예시입니다."
          />
        </div>
      </section>
    </div>
  );
}

function BarChart3Icon() {
  return (
    <div className="flex size-10 items-center justify-center rounded-md bg-teal-50 text-teal-700 ring-1 ring-teal-100">
      <TrendingUp className="size-5" aria-hidden="true" />
    </div>
  );
}
