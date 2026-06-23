import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const require = createRequire(path.join(repoRoot, "apps/web/package.json"));
const { chromium } = require("@playwright/test");
const rawDir = path.join(repoRoot, "docs/performance/raw");
const baseUrl = process.env.PERF_BASE_URL ?? "http://localhost:3100";
const outputPath =
  process.env.PERF_STORES_SEARCH_OUTPUT ??
  path.join(rawDir, "stores-search-current.json");
const label = process.env.PERF_STORES_SEARCH_LABEL ?? "current";
const searchTerm = process.env.PERF_STORES_SEARCH_TERM ?? "coffee";
const inputDelayMs = Number(process.env.PERF_STORES_SEARCH_INPUT_DELAY_MS ?? "600");
const settleBeforeMs = Number(process.env.PERF_STORES_SEARCH_SETTLE_BEFORE_MS ?? "1200");
const settleAfterMs = Number(process.env.PERF_STORES_SEARCH_SETTLE_AFTER_MS ?? "1500");

fs.mkdirSync(path.dirname(outputPath), { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ baseURL: baseUrl });
const apiStoreRequests = [];
const startedAt = performance.now();

try {
  await mockBrowserApi(page);
  await page.goto("/stores", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await page.locator("#store-keyword").waitFor({ state: "visible", timeout: 20_000 });
  await page.waitForTimeout(settleBeforeMs);

  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.pathname === "/api/stores") {
      apiStoreRequests.push(`${url.pathname}?${url.searchParams.toString()}`);
    }
  });

  let typedValue = "";
  await page.locator("#store-keyword").fill("");
  for (const char of searchTerm) {
    typedValue += char;
    await page.locator("#store-keyword").fill(typedValue);
    await page.waitForTimeout(inputDelayMs);
  }

  await page.locator("#store-keyword").press("Enter");
  await page.waitForTimeout(settleAfterMs);

  writeResult({
    status: "measured",
    results: [
      {
        route: "/stores",
        status: "measured",
        scenario: "slow typing with Enter submit after initial browser API settled",
        searchTerm,
        inputDelayMs,
        apiStoreRequestCount: apiStoreRequests.length,
        apiStoreRequests,
        elapsedMs: performance.now() - startedAt,
      },
    ],
  });
} catch (error) {
  writeResult({
    status: "failed",
    results: [
      {
        route: "/stores",
        status: "failed",
        scenario: "slow typing with Enter submit after initial browser API settled",
        searchTerm,
        inputDelayMs,
        apiStoreRequestCount: apiStoreRequests.length,
        apiStoreRequests,
        elapsedMs: performance.now() - startedAt,
        error: error instanceof Error ? error.message : String(error),
      },
    ],
  });
  process.exitCode = 1;
} finally {
  await browser.close();
}

function writeResult(payload) {
  fs.writeFileSync(
    outputPath,
    `${JSON.stringify(
      {
        ...payload,
        generatedAt: new Date().toISOString(),
        source: "scripts/performance/utils/measure-stores-search.mjs",
        label,
        baseUrl,
      },
      null,
      2,
    )}\n`,
  );
}

async function mockBrowserApi(page) {
  await page.route("**/api/**", async (route) => {
    const url = new URL(route.request().url());
    const pathname = url.pathname;
    const headers = { "Content-Type": "application/json" };

    if (pathname === "/api/regions") {
      await route.fulfill({ status: 200, headers, body: JSON.stringify([]) });
      return;
    }

    if (pathname === "/api/stores/categories") {
      await route.fulfill({ status: 200, headers, body: JSON.stringify([]) });
      return;
    }

    if (pathname === "/api/stores") {
      await route.fulfill({
        status: 200,
        headers,
        body: JSON.stringify({
          content: [],
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        }),
      });
      return;
    }

    await route.fulfill({ status: 200, headers, body: "{}" });
  });
}
