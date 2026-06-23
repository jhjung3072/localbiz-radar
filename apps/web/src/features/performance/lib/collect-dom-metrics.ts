import type { DomMetrics } from "@/features/performance/types";

export function collectDomMetrics(listElement: HTMLElement | null): DomMetrics {
  return {
    renderedRowCount: listElement?.querySelectorAll("[data-perf-row]").length ?? 0,
    totalDomNodeCount: document.body.querySelectorAll("*").length,
    listDomNodeCount: listElement?.querySelectorAll("*").length ?? 0,
  };
}
