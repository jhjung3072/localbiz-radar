"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Check, ListTree } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegacyStoreList } from "@/features/performance/components/legacy-store-list";
import { PerformanceResultPanel } from "@/features/performance/components/performance-result-panel";
import { RenderProfiler } from "@/features/performance/components/render-profiler";
import { VirtualStoreList } from "@/features/performance/components/virtual-store-list";
import { collectDomMetrics } from "@/features/performance/lib/collect-dom-metrics";
import { afterNextPaint, nowOrNull } from "@/features/performance/lib/performance-marks";
import type {
  LargeListMetric,
  MockStore,
  PerfListVariant,
} from "@/features/performance/types";

type PerformanceLabPageClientProps = {
  stores: MockStore[];
  variant: PerfListVariant;
  itemHeight: number;
  seed: number;
};

export function PerformanceLabPageClient({
  stores,
  variant,
  itemHeight,
  seed,
}: PerformanceLabPageClientProps) {
  const [selectedStore, setSelectedStore] = useState<MockStore | null>(null);
  const [metric, setMetric] = useState<LargeListMetric | null>(null);
  const metricRef = useRef<LargeListMetric | null>(null);
  const listRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const renderStartRef = useRef<number | null>(null);
  const profilerRef = useRef({
    actualDuration: null as number | null,
    baseDuration: null as number | null,
  });

  const recordMetric = useCallback(
    (patch: Partial<LargeListMetric> = {}) => {
      if (typeof window === "undefined") {
        return;
      }

      const renderStart = renderStartRef.current;
      const initialRenderMs =
        patch.initialRenderMs ??
        (renderStart === null ? null : performance.now() - renderStart);
      const domMetrics = collectDomMetrics(listRef.current);
      const nextMetric: LargeListMetric = {
        route: "/perf/large-list",
        variant,
        totalStoreCount: stores.length,
        itemHeight,
        initialRenderMs,
        scrollTestDurationMs: metricRef.current?.scrollTestDurationMs ?? null,
        clickToDetailOpenMs: metricRef.current?.clickToDetailOpenMs ?? null,
        profilerActualDuration: profilerRef.current.actualDuration,
        profilerBaseDuration: profilerRef.current.baseDuration,
        measuredAt: new Date().toISOString(),
        ...domMetrics,
        ...patch,
      };

      window.__LOCALBIZ_PERF_LAB__ = nextMetric;
      metricRef.current = nextMetric;
      setMetric(nextMetric);
    },
    [itemHeight, stores.length, variant],
  );

  useEffect(() => {
    renderStartRef.current = nowOrNull();
    metricRef.current = null;
    afterNextPaint(() => recordMetric({ clickToDetailOpenMs: null, scrollTestDurationMs: null }));
  }, [recordMetric]);

  const handleSelect = useCallback(
    (store: MockStore) => {
      const clickStart = nowOrNull();
      setSelectedStore(store);
      afterNextPaint(() => {
        recordMetric({
          clickToDetailOpenMs:
            clickStart === null ? null : performance.now() - clickStart,
        });
      });
    },
    [recordMetric],
  );

  const handleProfilerRender = useCallback(
    (
      _id: string,
      _phase: "mount" | "update" | "nested-update",
      actualDuration: number,
      baseDuration: number,
    ) => {
      profilerRef.current = { actualDuration, baseDuration };
    },
    [],
  );

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">Performance Lab</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-normal text-slate-950">
            대량 점포 목록 측정
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
            seed {seed}, {stores.length.toLocaleString()}개, row {itemHeight}px
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2" aria-label="목록 방식">
          <Button variant={variant === "legacy" ? "default" : "outline"} asChild>
            <Link href={buildVariantHref("legacy", stores.length, itemHeight, seed)}>
              {variant === "legacy" ? <Check aria-hidden="true" /> : <ListTree aria-hidden="true" />}
              Legacy
            </Link>
          </Button>
          <Button variant={variant === "virtual" ? "default" : "outline"} asChild>
            <Link href={buildVariantHref("virtual", stores.length, itemHeight, seed)}>
              {variant === "virtual" ? <Check aria-hidden="true" /> : <ListTree aria-hidden="true" />}
              Virtual
            </Link>
          </Button>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <RenderProfiler id={`large-list-${variant}`} onRender={handleProfilerRender}>
          {variant === "legacy" ? (
            <LegacyStoreList
              stores={stores}
              itemHeight={itemHeight}
              listRef={listRef}
              viewportRef={viewportRef}
              onSelect={handleSelect}
            />
          ) : (
            <VirtualStoreList
              stores={stores}
              itemHeight={itemHeight}
              listRef={listRef}
              viewportRef={viewportRef}
              onSelect={handleSelect}
            />
          )}
        </RenderProfiler>

        <div className="space-y-4">
          <PerformanceResultPanel metric={metric} />
          {selectedStore ? (
            <section
              className="rounded-[8px] border border-slate-200 bg-white p-4 shadow-sm"
              aria-label="선택 점포 상세"
              data-perf-detail-panel
            >
              <p className="text-xs font-semibold text-teal-700">
                {selectedStore.categorySmallName}
              </p>
              <h2 className="mt-2 text-base font-semibold text-slate-950">
                {selectedStore.storeName}
              </h2>
              <dl className="mt-3 space-y-2 text-sm text-slate-600">
                <div>
                  <dt className="font-medium text-slate-500">주소</dt>
                  <dd>{selectedStore.roadAddress}</dd>
                </div>
                <div>
                  <dt className="font-medium text-slate-500">좌표</dt>
                  <dd>
                    {selectedStore.latitude}, {selectedStore.longitude}
                  </dd>
                </div>
              </dl>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function buildVariantHref(
  variant: PerfListVariant,
  count: number,
  itemHeight: number,
  seed: number,
) {
  const params = new URLSearchParams({
    variant,
    count: String(count),
    itemHeight: String(itemHeight),
    seed: String(seed),
  });

  return `/perf/large-list?${params.toString()}`;
}
