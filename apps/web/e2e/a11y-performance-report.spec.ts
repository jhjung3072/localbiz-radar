import fs from "node:fs";
import path from "node:path";
import { test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApi } from "./helpers/api-mocks";

type A11yRouteResult = {
  route: string;
  status: "measured" | "failed";
  counts: Record<"critical" | "serious" | "moderate" | "minor", number>;
  violationIds: string[];
  error?: string;
};

test.describe.configure({ mode: "serial" });

const isReportEnabled = process.env.PERF_A11Y_REPORT === "true";
const repoRoot = path.resolve(process.cwd(), "../..");
const outputPath = path.join(repoRoot, "docs/performance/raw/a11y-current.json");
const results: A11yRouteResult[] = [];
const routes = [
  "/",
  "/dashboard",
  "/stores",
  "/map",
  "/compare",
  "/reports/compare?baseCtprvnCd=11&baseSignguCd=11680&targetCtprvnCd=11&targetSignguCd=11440",
  "/admin/login",
];

test.skip(!isReportEnabled, "PERF_A11Y_REPORT=true일 때만 접근성 리포트를 생성합니다.");

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

for (const route of routes) {
  test(`collects accessibility baseline on ${route}`, async ({ page }) => {
    try {
      await page.goto(route);
      await page.waitForLoadState("networkidle", { timeout: 10_000 }).catch(() => undefined);

      const builder = new AxeBuilder({ page }).withTags([
        "wcag2a",
        "wcag2aa",
        "wcag21a",
        "wcag21aa",
      ]);

      if (route.startsWith("/map")) {
        builder.exclude("[data-kakao-map-root]");
      }

      const analysis = await builder.analyze();
      const counts = {
        critical: 0,
        serious: 0,
        moderate: 0,
        minor: 0,
      };

      for (const violation of analysis.violations) {
        const impact = violation.impact;
        if (impact === "critical" || impact === "serious" || impact === "moderate" || impact === "minor") {
          counts[impact] += 1;
        }
      }

      results.push({
        route,
        status: "measured",
        counts,
        violationIds: analysis.violations.map((violation) => violation.id),
      });
    } catch (error) {
      results.push({
        route,
        status: "failed",
        counts: { critical: 0, serious: 0, moderate: 0, minor: 0 },
        violationIds: [],
        error: error instanceof Error ? error.message : String(error),
      });
    }
  });
}

test.afterAll(async () => {
  if (!isReportEnabled || results.length === 0) {
    return;
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        source: "apps/web/e2e/a11y-performance-report.spec.ts",
        results,
      },
      null,
      2,
    )}\n`,
  );
});
