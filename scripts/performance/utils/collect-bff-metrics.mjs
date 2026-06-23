import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const webRequire = createRequire(path.join(process.cwd(), "apps/web/package.json"));
const { chromium } = webRequire("@playwright/test");

const args = parseArgs(process.argv.slice(2));
const baseUrl = (args["base-url"] ?? "http://localhost:3100").replace(/\/$/, "");
const output = args.output ?? "docs/performance/raw/bff-current.json";
const label = args.label ?? "current";
const gitRef = args["git-ref"] ?? "HEAD";
const routes = (args.routes ?? "/dashboard,/compare,/stores").split(",");

const browser = await chromium.launch({ headless: true });
const results = [];

try {
  for (const route of routes) {
    const page = await browser.newPage();
    const requests = [];
    const responses = [];

    await page.addInitScript(() => {
      window.__LOCALBIZ_ROUTE_METRICS__ = {
        cls: 0,
        lcp: 0,
        longTasks: [],
      };

      if ("PerformanceObserver" in window) {
        try {
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              window.__LOCALBIZ_ROUTE_METRICS__.lcp = entry.startTime;
            }
          }).observe({ type: "largest-contentful-paint", buffered: true });
        } catch {
          // Browser support differs across local environments.
        }

        try {
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              if (!entry.hadRecentInput) {
                window.__LOCALBIZ_ROUTE_METRICS__.cls += entry.value;
              }
            }
          }).observe({ type: "layout-shift", buffered: true });
        } catch {
          // Browser support differs across local environments.
        }

        try {
          new PerformanceObserver((entryList) => {
            for (const entry of entryList.getEntries()) {
              window.__LOCALBIZ_ROUTE_METRICS__.longTasks.push(entry.duration);
            }
          }).observe({ type: "longtask", buffered: true });
        } catch {
          // Browser support differs across local environments.
        }
      }
    });

    page.on("request", (request) => {
      requests.push({
        url: request.url(),
        method: request.method(),
        resourceType: request.resourceType(),
      });
    });
    page.on("response", (response) => {
      responses.push({
        url: response.url(),
        status: response.status(),
      });
    });

    const startedAt = Date.now();
    let status = "measured";
    let error = null;

    try {
      await page.goto(`${baseUrl}${route}`, {
        waitUntil: "networkidle",
        timeout: 45_000,
      });
      await page.waitForTimeout(1_000);
    } catch (caught) {
      status = "failed";
      error = caught instanceof Error ? caught.message : String(caught);
    }

    const browserMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType("navigation")[0];
      const resources = performance.getEntriesByType("resource");
      const routeMetrics = window.__LOCALBIZ_ROUTE_METRICS__ ?? {
        cls: 0,
        lcp: 0,
        longTasks: [],
      };
      const jsTransferSize = resources
        .filter((entry) => entry.name.includes(".js"))
        .reduce((sum, entry) => sum + (entry.transferSize ?? 0), 0);
      const networkEnd = resources.reduce(
        (max, entry) => Math.max(max, entry.responseEnd ?? 0),
        navigation?.responseEnd ?? 0,
      );
      const totalBlockingTime = routeMetrics.longTasks.reduce(
        (sum, duration) => sum + Math.max(duration - 50, 0),
        0,
      );

      return {
        lcpMs: routeMetrics.lcp || null,
        cls: routeMetrics.cls,
        tbtMs: totalBlockingTime,
        jsTransferSizeBytes: jsTransferSize,
        initialLoadCompleteMs: navigation?.loadEventEnd ?? null,
        networkWaterfallMs: networkEnd,
      };
    });

    const requestSummary = summarizeRequests(requests);

    results.push({
      route,
      status,
      error,
      elapsedMs: Date.now() - startedAt,
      requestCount: requests.length,
      responseCount: responses.length,
      apiRequestCount: requestSummary.apiRequestCount,
      bffRequestCount: requestSummary.bffRequestCount,
      browserMetrics,
      requests: requestSummary.requests,
    });

    await page.close();
  }
} finally {
  await browser.close();
}

writeJson(output, {
  status: results.some((result) => result.status === "failed") ? "partial" : "measured",
  generatedAt: new Date().toISOString(),
  source: "scripts/performance/utils/collect-bff-metrics.mjs",
  label,
  gitRef,
  baseUrl,
  results,
});

function summarizeRequests(requests) {
  const summarized = requests.map((request) => {
    const url = new URL(request.url);
    return {
      method: request.method,
      path: url.pathname,
      resourceType: request.resourceType,
    };
  });

  return {
    apiRequestCount: summarized.filter((request) => request.path.startsWith("/api/")).length,
    bffRequestCount: summarized.filter((request) => request.path.startsWith("/bff/")).length,
    requests: summarized,
  };
}

function parseArgs(items) {
  const parsed = {};

  for (let index = 0; index < items.length; index += 1) {
    const item = items[index];
    if (!item.startsWith("--")) {
      continue;
    }
    const key = item.slice(2);
    parsed[key] = items[index + 1];
    index += 1;
  }

  return parsed;
}

function writeJson(filePath, data) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`);
}
