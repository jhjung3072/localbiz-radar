import { Activity, BadgePercent, GitCompare, Layers3, MapPinned, Trophy } from "lucide-react";
import { MetricCard } from "@/components/common/metric-card";
import { CategoryMixChart } from "@/features/analysis/category-mix-chart";
import { categoryMix, comparisonAreas } from "@/features/analysis/mock-analysis";

export default function AnalysisPage() {
  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-3">
        <p className="text-sm font-semibold text-teal-700">상권 분석 목업</p>
        <div>
          <h1 className="text-3xl font-semibold tracking-normal text-slate-950">
            상권 분석
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            지역과 업종을 선택해 경쟁 수준과 카테고리 구성을 살펴보는 목업
            분석 화면입니다.
          </p>
        </div>
      </section>

      <section
        aria-label="분석 조건 선택"
        className="grid gap-4 rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm md:grid-cols-3"
      >
        <div>
          <label
            htmlFor="analysis-region"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            지역
          </label>
          <select
            id="analysis-region"
            defaultValue="mapo"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
          >
            <option value="mapo">서울특별시 마포구</option>
            <option value="seongdong">서울특별시 성동구</option>
            <option value="haeundae">부산광역시 해운대구</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="analysis-category"
            className="mb-2 block text-sm font-medium text-slate-700"
          >
            업종
          </label>
          <select
            id="analysis-category"
            defaultValue="food"
            className="h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-teal-500 focus:ring-3 focus:ring-teal-500/20"
          >
            <option value="food">음식</option>
            <option value="retail">소매</option>
            <option value="service">생활서비스</option>
            <option value="education">교육</option>
          </select>
        </div>
        <div className="flex items-end">
          <div className="w-full rounded-md bg-slate-50 px-3 py-2 text-sm leading-6 text-slate-600">
            선택값은 현재 화면에서 정적 목업으로만 표시됩니다.
          </div>
        </div>
      </section>

      <section
        aria-label="분석 지표"
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="경쟁 점포 수"
          value="1,284개"
          description="선택 업종과 인접 업종 포함"
          icon={<Activity className="size-5" />}
          accent="teal"
        />
        <MetricCard
          title="점포 밀도"
          value="높음"
          description="행정동 면적 대비 목업 등급"
          icon={<MapPinned className="size-5" />}
          accent="indigo"
        />
        <MetricCard
          title="업종 다양성"
          value="7.6/10"
          description="업종 분산도를 단순 점수화"
          icon={<Layers3 className="size-5" />}
          accent="amber"
        />
        <MetricCard
          title="LocalBiz 점수"
          value="82.1"
          description="성장성과 경쟁도를 합친 예시 점수"
          icon={<Trophy className="size-5" />}
          accent="rose"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <BadgePercent className="size-5 text-indigo-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-950">
              카테고리 구성
            </h2>
          </div>
          <CategoryMixChart data={categoryMix} />
        </article>

        <article className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center gap-2">
            <GitCompare className="size-5 text-teal-700" aria-hidden="true" />
            <h2 className="text-xl font-semibold text-slate-950">
              A/B 비교 미리보기
            </h2>
          </div>
          <div className="grid gap-4">
            {comparisonAreas.map((area) => (
              <div
                key={area.name}
                className="rounded-md border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-slate-950">{area.name}</h3>
                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {area.note}
                    </p>
                  </div>
                  <span className="rounded-md bg-white px-2 py-1 text-sm font-semibold text-indigo-700 ring-1 ring-slate-200">
                    {area.score}
                  </span>
                </div>
                <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <dt className="text-slate-500">점포 수</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {area.stores}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-slate-500">밀도</dt>
                    <dd className="mt-1 font-semibold text-slate-950">
                      {area.density}
                    </dd>
                  </div>
                </dl>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  );
}
