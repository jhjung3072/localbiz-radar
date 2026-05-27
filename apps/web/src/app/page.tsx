import Link from "next/link";
import {
  ArrowRight,
  BarChart3,
  Database,
  Layers3,
  MapPinned,
  ShieldCheck,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const features = [
    {
      title: "점포 분포 분석",
      description: "업종과 행정구역별 점포 분포를 빠르게 파악합니다.",
      icon: Store,
      tone: "bg-teal-50 text-teal-700",
    },
    {
      title: "경쟁 강도 분석",
      description: "선택한 지역에서 업종별 경쟁 강도를 비교합니다.",
      icon: BarChart3,
      tone: "bg-indigo-50 text-indigo-700",
    },
    {
      title: "후보 지역 비교",
      description: "A/B 지역의 상권 규모와 업종 구성을 나란히 봅니다.",
      icon: MapPinned,
      tone: "bg-amber-50 text-amber-700",
    },
    {
      title: "공공 데이터 기반 인사이트",
      description: "공개된 상가업소 데이터를 기준으로 분석 흐름을 설계합니다.",
      icon: Database,
      tone: "bg-rose-50 text-rose-700",
    },
  ];

  return (
    <div className="space-y-10">
      <section className="grid items-center gap-8 py-8 lg:grid-cols-[1.02fr_0.98fr] lg:py-12">
        <div className="max-w-2xl">
          <p className="mb-4 inline-flex rounded-md bg-teal-50 px-3 py-1 text-sm font-medium text-teal-700 ring-1 ring-teal-100">
            공공 데이터 기반 지역 상권 분석
          </p>
          <h1 className="text-4xl font-semibold tracking-normal text-slate-950 sm:text-5xl">
            LocalBiz Radar
          </h1>
          <p className="mt-5 text-lg leading-8 text-slate-600">
            상가 분포, 경쟁 밀도, 지역 비교를 한 화면에서 확인하는 로컬
            커머스 분석 대시보드입니다.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-11 px-4">
              <Link href="/dashboard">
                대시보드 보기
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-11 px-4">
              <Link href="/api-setup">API 보안 정책 확인</Link>
            </Button>
          </div>
        </div>

        <figure
          aria-label="LocalBiz Radar 대시보드 미리보기"
          className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-xl shadow-slate-200/70"
        >
          <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <p className="text-sm font-semibold text-slate-950">서울 마포구</p>
              <p className="text-xs text-slate-500">업종 분포 요약</p>
            </div>
            <span className="rounded-md bg-teal-50 px-2 py-1 text-xs font-medium text-teal-700">
              목업
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {["음식점", "카페", "생활서비스"].map((label, index) => (
              <div key={label} className="rounded-md bg-slate-50 p-3">
                <p className="text-xs text-slate-500">{label}</p>
                <p className="mt-2 text-xl font-semibold text-slate-950">
                  {[1280, 740, 515][index].toLocaleString("ko-KR")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex h-44 items-end gap-3 rounded-md bg-slate-50 p-4">
            {[62, 88, 54, 76, 46, 68, 93, 58].map((height, index) => (
              <div
                key={height}
                className="flex flex-1 items-end rounded-sm bg-teal-600/15"
              >
                <div
                  className="w-full rounded-sm bg-teal-600"
                  style={{ height: `${height}%` }}
                  aria-hidden="true"
                />
                <span className="sr-only">
                  미리보기 막대 {index + 1}: {height}%
                </span>
              </div>
            ))}
          </div>
        </figure>
      </section>

      <section aria-labelledby="feature-title" className="space-y-5">
        <div>
          <p className="text-sm font-semibold text-teal-700">핵심 기능</p>
          <h2 id="feature-title" className="mt-2 text-2xl font-semibold text-slate-950">
            초기 화면에서 확인할 수 있는 분석 흐름
          </h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article
                key={feature.title}
                className="rounded-[8px] border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div
                  className={`flex size-10 items-center justify-center rounded-md ${feature.tone}`}
                  aria-hidden="true"
                >
                  <Icon className="size-5" />
                </div>
                <h3 className="mt-4 text-base font-semibold text-slate-950">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      <section
        aria-labelledby="data-source-title"
        className="grid gap-5 rounded-[8px] border border-slate-200 bg-slate-950 p-6 text-white md:grid-cols-[auto_1fr]"
      >
        <div className="flex size-12 items-center justify-center rounded-md bg-white/10">
          <ShieldCheck className="size-6" aria-hidden="true" />
        </div>
        <div>
          <h2 id="data-source-title" className="text-xl font-semibold">
            데이터 출처와 키 보안
          </h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-200">
            LocalBiz Radar는 공개 가능한 공공 데이터 기반 분석을 목표로
            합니다. 실제 공공 API 연동은 이후 단계에서 Spring Boot 백엔드를
            통해서만 추가하며, 서비스 키와 같은 민감한 값은 프론트엔드에
            노출하지 않습니다.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm text-slate-100">
            <Layers3 className="size-4" aria-hidden="true" />
            API 키는 백엔드에서만 관리합니다.
          </div>
        </div>
      </section>
    </div>
  );
}
