import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const lhciDir = path.join(repoRoot, "docs/performance/raw/lhci-current");
const outputPath = path.join(repoRoot, "docs/performance/raw/lighthouse-current.json");
const lhrs = findJsonFiles(lhciDir)
  .map(readJson)
  .filter((data) => data?.lighthouseVersion && data?.audits);
const byRoute = new Map();

for (const lhr of lhrs) {
  const route = routeFromUrl(lhr.finalDisplayedUrl ?? lhr.finalUrl ?? "");
  if (!byRoute.has(route)) {
    byRoute.set(route, []);
  }
  byRoute.get(route).push(toMetrics(lhr));
}

const routes = [...byRoute.entries()].map(([route, runs]) => ({
  route,
  runCount: runs.length,
  median: medianMetrics(runs),
  runs,
}));

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(
  outputPath,
  `${JSON.stringify(
    {
      status: routes.length > 0 ? "measured" : "failed",
      generatedAt: new Date().toISOString(),
      source: "apps/web/scripts/performance/parse-lighthouse-results.mjs",
      lhciDir,
      routes,
    },
    null,
    2,
  )}\n`,
);

function toMetrics(lhr) {
  return {
    performanceScore: Math.round((lhr.categories?.performance?.score ?? 0) * 100),
    lcpMs: auditValue(lhr, "largest-contentful-paint"),
    tbtMs: auditValue(lhr, "total-blocking-time"),
    cls: auditValue(lhr, "cumulative-layout-shift"),
    speedIndexMs: auditValue(lhr, "speed-index"),
    jsTransferSizeBytes: auditValue(lhr, "total-byte-weight"),
    requestCount: lhr.audits?.["network-requests"]?.details?.items?.length ?? null,
  };
}

function medianMetrics(runs) {
  const keys = Object.keys(runs[0] ?? {});
  return Object.fromEntries(keys.map((key) => [key, median(runs.map((run) => run[key]))]));
}

function median(values) {
  const numbers = values.filter((value) => typeof value === "number" && Number.isFinite(value));
  if (numbers.length === 0) {
    return null;
  }

  numbers.sort((a, b) => a - b);
  return numbers[Math.floor(numbers.length / 2)];
}

function auditValue(lhr, key) {
  const value = lhr.audits?.[key]?.numericValue;
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function routeFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.pathname;
  } catch {
    return url || "unknown";
  }
}

function findJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const files = [];
  walk(dir, (file) => {
    if (file.endsWith(".json")) {
      files.push(file);
    }
  });
  return files;
}

function walk(dir, visit) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(fullPath, visit);
    } else {
      visit(fullPath);
    }
  }
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}
