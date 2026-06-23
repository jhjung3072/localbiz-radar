import fs from "node:fs";
import path from "node:path";
import { expect, test, type Page } from "@playwright/test";
import type { LargeListMetric, PerfListVariant } from "../src/features/performance/types";

test.describe.configure({ mode: "serial" });

const isPerfLabEnabled = process.env.NEXT_PUBLIC_ENABLE_PERF_LAB === "true";
const repoRoot = path.resolve(process.cwd(), "../..");
const outputPath = path.join(repoRoot, "test-results/performance/large-list.json");
const counts = [100, 500, 1000, 2000];
const variants: PerfListVariant[] = ["legacy", "virtual"];
const results: LargeListMetric[] = [];

test.skip(!isPerfLabEnabled, "NEXT_PUBLIC_ENABLE_PERF_LAB=true일 때만 실행합니다.");

for (const count of counts) {
  for (const variant of variants) {
    test(`${variant} list renders ${count} stores with measurable metrics`, async ({ page }) => {
      await page.goto(`/perf/large-list?count=${count}&variant=${variant}&itemHeight=72`);
      await expect(page.getByRole("heading", { name: "대량 점포 목록 측정" })).toBeVisible();

      const initialMetric = await waitForMetric(page);
      expect(initialMetric.totalStoreCount).toBe(count);
      expect(initialMetric.variant).toBe(variant);
      expect(initialMetric.renderedRowCount).toBeGreaterThan(0);

      const scrollTestDurationMs = await page
        .locator("[data-perf-list-viewport]")
        .evaluate(async (element) => {
          const start = performance.now();
          const maxScroll = element.scrollHeight - element.clientHeight;
          const steps = 8;

          for (let index = 1; index <= steps; index += 1) {
            element.scrollTop = Math.round((maxScroll * index) / steps);
            await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
          }

          return performance.now() - start;
        });

      await page.locator("[data-perf-list-viewport]").evaluate((element) => {
        element.scrollTop = 0;
      });
      await page.waitForTimeout(50);

      const clickStartedAt = await page.evaluate(() => performance.now());
      await page.locator("[data-perf-detail-button]").first().click();
      await expect(page.getByRole("region", { name: "선택 점포 상세" })).toBeVisible();
      const clickToDetailOpenMs = await page.evaluate(
        (startedAt) => performance.now() - startedAt,
        clickStartedAt,
      );

      const finalMetric = await page.evaluate(
        ({ scrollDuration, clickDuration }) => {
          const metric = window.__LOCALBIZ_PERF_LAB__;
          if (!metric) {
            throw new Error("Performance metric was not collected.");
          }
          const nextMetric = {
            ...metric,
            scrollTestDurationMs: scrollDuration,
            clickToDetailOpenMs: clickDuration,
            measuredAt: new Date().toISOString(),
          };
          window.__LOCALBIZ_PERF_LAB__ = nextMetric;
          return nextMetric;
        },
        { scrollDuration: scrollTestDurationMs, clickDuration: clickToDetailOpenMs },
      );

      results.push(finalMetric);
    });
  }
}

test.afterAll(async () => {
  if (!isPerfLabEnabled || results.length === 0) {
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "apps/web/e2e/perf-large-list.spec.ts",
        results,
      },
      null,
      2,
    )}\n`,
  );
});

async function waitForMetric(page: Page) {
  return page.waitForFunction(() => window.__LOCALBIZ_PERF_LAB__ ?? null).then(async (handle) => {
    const metric = await handle.jsonValue();
    if (!metric) {
      throw new Error("Performance metric was not collected.");
    }
    return metric as LargeListMetric;
  });
}
