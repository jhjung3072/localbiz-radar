export type PerfListVariant = "legacy" | "virtual";

export type MockStore = {
  id: number;
  storeName: string;
  categoryLargeCode: string;
  categoryLargeName: string;
  categoryMediumCode: string;
  categoryMediumName: string;
  categorySmallCode: string;
  categorySmallName: string;
  sidoCode: string;
  sidoName: string;
  sigunguCode: string;
  sigunguName: string;
  dongCode: string;
  dongName: string;
  roadAddress: string;
  latitude: number;
  longitude: number;
};

export type DomMetrics = {
  renderedRowCount: number;
  totalDomNodeCount: number;
  listDomNodeCount: number;
};

export type LargeListMetric = DomMetrics & {
  route: string;
  variant: PerfListVariant;
  totalStoreCount: number;
  itemHeight: number;
  initialRenderMs: number | null;
  scrollTestDurationMs: number | null;
  clickToDetailOpenMs: number | null;
  profilerActualDuration: number | null;
  profilerBaseDuration: number | null;
  measuredAt: string;
};

declare global {
  interface Window {
    __LOCALBIZ_PERF_LAB__?: LargeListMetric;
  }
}
