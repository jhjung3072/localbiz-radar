import { notFound } from "next/navigation";
import { PerformanceLabPageClient } from "@/features/performance/components/performance-lab-page-client";
import { createMockStores } from "@/features/performance/mock/create-mock-stores";
import type { PerfListVariant } from "@/features/performance/types";

type LargeListPerfPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

const allowedCounts = new Set([100, 500, 1000, 2000]);

export default async function LargeListPerfPage({
  searchParams,
}: LargeListPerfPageProps) {
  if (process.env.NEXT_PUBLIC_ENABLE_PERF_LAB !== "true") {
    notFound();
  }

  const params = await searchParams;
  const count = parseCount(getParam(params, "count"));
  const variant = parseVariant(getParam(params, "variant"));
  const itemHeight = parseItemHeight(getParam(params, "itemHeight"));
  const seed = parseSeed(getParam(params, "seed"));
  const stores = createMockStores(count, seed);

  return (
    <PerformanceLabPageClient
      stores={stores}
      variant={variant}
      itemHeight={itemHeight}
      seed={seed}
    />
  );
}

function getParam(
  params: Record<string, string | string[] | undefined> | undefined,
  key: string,
) {
  const value = params?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function parseCount(value: string | undefined) {
  const count = Number(value ?? "1000");
  return allowedCounts.has(count) ? count : 1000;
}

function parseVariant(value: string | undefined): PerfListVariant {
  return value === "legacy" || value === "virtual" ? value : "virtual";
}

function parseItemHeight(value: string | undefined) {
  const itemHeight = Number(value ?? "72");
  if (!Number.isFinite(itemHeight)) {
    return 72;
  }
  return Math.min(Math.max(Math.round(itemHeight), 48), 120);
}

function parseSeed(value: string | undefined) {
  const seed = Number(value ?? "20260617");
  return Number.isFinite(seed) ? Math.round(seed) : 20260617;
}
