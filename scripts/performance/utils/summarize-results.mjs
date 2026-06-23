import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const docsDir = path.join(repoRoot, "docs/performance");
const rawDir = path.join(docsDir, "raw");
const summaryPath = path.join(docsDir, "frontend-performance-summary.md");
const planPath = path.join(docsDir, "00-measurement-plan.md");
const notesPath = path.join(docsDir, "00-measurement-notes.md");
const gitRef = git("rev-parse --short HEAD") ?? "HEAD";

const bffBefore = readJson(path.join(rawDir, "bff-before.json"));
const bffAfter = readJson(path.join(rawDir, "bff-after.json"));
const largeList = readJson(path.join(rawDir, "large-list-current.json"));
const a11yBefore = readJson(path.join(rawDir, "a11y-before.json"));
const a11yAfter = readJson(path.join(rawDir, "a11y-after.json")) ?? readJson(path.join(rawDir, "a11y-current.json"));
const lighthouseBefore = readJson(path.join(rawDir, "lighthouse-before.json"));
const lighthouseAfter =
  readJson(path.join(rawDir, "lighthouse-after.json")) ?? readJson(path.join(rawDir, "lighthouse-current.json"));
const bundleBefore = readJson(path.join(rawDir, "bundle-before.json"));
const bundleAfter = readJson(path.join(rawDir, "bundle-after.json")) ?? readJson(path.join(rawDir, "bundle-current.json"));
const storesSearchBefore = readJson(path.join(rawDir, "stores-search-before.json"));
const storesSearchAfter =
  readJson(path.join(rawDir, "stores-search-after.json")) ?? readJson(path.join(rawDir, "stores-search-current.json"));

fs.mkdirSync(rawDir, { recursive: true });
fs.mkdirSync(path.join(rawDir, "errors"), { recursive: true });

writePlan();
ensureNotes();
writeSummary();

function writePlan() {
  fs.writeFileSync(
    planPath,
    `# 프론트엔드 성능 측정 계획

## 측정 원칙

- production build + start 기준으로 측정한다.
- 실제 수치가 없는 항목은 TODO 또는 측정 실패로 둔다.
- serviceKey, JWT, cookie, Sentry token은 raw와 문서에 남기지 않는다.
- /perf route는 NEXT_PUBLIC_ENABLE_PERF_LAB=true일 때만 접근한다.

## before/after ref

- BFF before: e224462
- BFF after: ${gitRef}, 측정 당시 HEAD
- 대량 목록 before: ${gitRef} legacy variant
- 대량 목록 after: ${gitRef}, 측정 당시 HEAD virtual variant
- 접근성 before/after: ${gitRef} 기반 working tree, scrollable region focus 보정 전/후
- /map CLS before/after: ${gitRef} 기반 working tree, layout shift 보정 전/후
- bundle before/after: ${gitRef} 기반 working tree, chart dynamic import 전/후
- /stores 검색 before/after: ${gitRef} 기반 working tree, debounce 자동 검색 전/submit 기반 검색 후

## 재실행 명령

\`\`\`bash
pnpm perf:measure
pnpm perf:large-list
pnpm perf:lhci
pnpm perf:bundle
pnpm perf:a11y
pnpm perf:stores-search
pnpm perf:cleanup
\`\`\`
`,
  );
}

function ensureNotes() {
  if (fs.existsSync(notesPath)) {
    return;
  }

  fs.writeFileSync(
    notesPath,
    `# 성능 측정 notes

- 생성 시각: ${new Date().toISOString()}
- 현재 git ref: ${gitRef}
- 실패한 측정은 docs/performance/raw/errors 아래 로그를 확인한다.
`,
  );
}

function writeSummary() {
  const dashboardBefore = routeResult(bffBefore, "/dashboard");
  const dashboardAfter = routeResult(bffAfter, "/dashboard");
  const legacy1000 = listResult(1000, "legacy");
  const virtual1000 = listResult(1000, "virtual");
  const storesA11yBefore = a11yRoute(a11yBefore, "/stores");
  const storesA11yAfter = a11yRoute(a11yAfter, "/stores");
  const mapLhBefore = lighthouseRoute(lighthouseBefore, "/map");
  const mapLhAfter = lighthouseRoute(lighthouseAfter, "/map");
  const dashboardLhBefore = lighthouseRoute(lighthouseBefore, "/dashboard");
  const dashboardLhAfter = lighthouseRoute(lighthouseAfter, "/dashboard");
  const compareBundleBefore = bundleRoute(bundleBefore, "/compare");
  const compareBundleAfter = bundleRoute(bundleAfter, "/compare");
  const storesSearchBeforeCount = storesSearchCount(storesSearchBefore);
  const storesSearchAfterCount = storesSearchCount(storesSearchAfter);

  const confirmedBullets = [];
  if (dashboardBefore && dashboardAfter) {
    const beforeJs = dashboardBefore.browserMetrics?.jsTransferSizeBytes;
    const afterJs = dashboardAfter.browserMetrics?.jsTransferSizeBytes;
    if (
      isNumber(beforeJs) &&
      isNumber(afterJs) &&
      dashboardAfter.apiRequestCount < dashboardBefore.apiRequestCount &&
      afterJs < beforeJs
    ) {
      confirmedBullets.push(
        `Dashboard \`/api\` 요청 수 ${dashboardBefore.apiRequestCount}개 → ${dashboardAfter.apiRequestCount}개, JS transfer ${formatCompactBytes(beforeJs)} → ${formatCompactBytes(afterJs)}`,
      );
    }
  }
  if (legacy1000 && virtual1000) {
    confirmedBullets.push(
      `mock ${formatCount(legacy1000.totalStoreCount)}개 목록 DOM node 수 ${formatCount(legacy1000.listDomNodeCount)}개 → ${formatCount(virtual1000.listDomNodeCount)}개, initial render ${formatMs(legacy1000.initialRenderMs)} → ${formatMs(virtual1000.initialRenderMs)}`,
    );
  }
  if (improved(a11yCount(storesA11yBefore), a11yCount(storesA11yAfter))) {
    confirmedBullets.push(
      `\`/stores\` axe critical/serious accessibility violation ${a11yCount(storesA11yBefore)}건 → ${a11yCount(storesA11yAfter)}건`,
    );
  }
  if (improved(mapLhBefore?.cls, mapLhAfter?.cls)) {
    confirmedBullets.push(
      `\`/map\` Lighthouse CLS ${formatNumber(mapLhBefore.cls)} → ${formatNumber(mapLhAfter.cls)}으로 낮춰 0.1 이하 기준 달성`,
    );
  }
  if (improved(compareBundleBefore?.bytes, compareBundleAfter?.bytes)) {
    confirmedBullets.push(
      `\`/compare\` route JS bundle size ${formatCompactBytes(compareBundleBefore.bytes)} → ${formatCompactBytes(compareBundleAfter.bytes)}`,
    );
  }
  if (improved(storesSearchBeforeCount, storesSearchAfterCount)) {
    confirmedBullets.push(
      `\`/stores\` 검색 입력 시 browser \`/api/stores\` 호출 수 ${storesSearchBeforeCount}회 → ${storesSearchAfterCount}회`,
    );
  }

  fs.writeFileSync(
    summaryPath,
    `# 프론트엔드 성능 측정 summary

| 개선 항목 | Before | After | 개선 폭 | 개선 방식 | 근거 파일 |
| --------- | -----: | ----: | ------: | --------- | --------- |
| Dashboard API 요청 수 | ${formatValue(dashboardBefore?.apiRequestCount)} | ${formatValue(dashboardAfter?.apiRequestCount)} | ${improvement(dashboardBefore?.apiRequestCount, dashboardAfter?.apiRequestCount)} | BFF aggregate | docs/performance/raw/bff-before.json, docs/performance/raw/bff-after.json |
| 1000개 목록 DOM node 수 | ${formatValue(legacy1000?.listDomNodeCount)} | ${formatValue(virtual1000?.listDomNodeCount)} | ${improvement(legacy1000?.listDomNodeCount, virtual1000?.listDomNodeCount)} | Virtualized list | docs/performance/raw/large-list-current.json |
| \`/stores\` critical/serious a11y violation | ${formatValue(a11yCount(storesA11yBefore))} | ${formatValue(a11yCount(storesA11yAfter))} | ${improvement(a11yCount(storesA11yBefore), a11yCount(storesA11yAfter), "건")} | scrollable region focus 보정 | docs/performance/raw/a11y-before.json, docs/performance/raw/a11y-after.json |
| \`/map\` Lighthouse CLS | ${formatNumber(mapLhBefore?.cls)} | ${formatNumber(mapLhAfter?.cls)} | ${improvement(mapLhBefore?.cls, mapLhAfter?.cls)} | map skeleton/container/list panel 높이 안정화 | docs/performance/raw/lighthouse-before.json, docs/performance/raw/lighthouse-after.json |
| \`/compare\` route JS bundle | ${formatBytes(compareBundleBefore?.bytes)} | ${formatBytes(compareBundleAfter?.bytes)} | ${improvement(compareBundleBefore?.bytes, compareBundleAfter?.bytes, "bytes")} | Recharts chart dynamic import | docs/performance/raw/bundle-before.json, docs/performance/raw/bundle-after.json |
| \`/stores\` 검색 browser \`/api/stores\` 호출 수 | ${formatValue(storesSearchBeforeCount)} | ${formatValue(storesSearchAfterCount)} | ${improvement(storesSearchBeforeCount, storesSearchAfterCount, "회")} | 입력 중 자동 query 반영 제거, submit 시점 요청 | docs/performance/raw/stores-search-before.json, docs/performance/raw/stores-search-after.json |

## 개선되지 않은 추적 지표

| 추적 지표 | Before | After | 변화 | 해석 | 근거 파일 |
| --------- | -----: | ----: | ---: | ---- | --------- |
| Dashboard BFF LCP | ${formatMs(dashboardBefore?.browserMetrics?.lcpMs)} | ${formatMs(dashboardAfter?.browserMetrics?.lcpMs)} | ${improvement(dashboardBefore?.browserMetrics?.lcpMs, dashboardAfter?.browserMetrics?.lcpMs, "ms")} | 개선 항목 아님. BFF LCP 개선 문장에 사용하지 않음 | docs/performance/raw/bff-before.json, docs/performance/raw/bff-after.json |
| Dashboard Lighthouse JS transfer | ${formatBytes(dashboardLhBefore?.jsTransferSizeBytes)} | ${formatBytes(dashboardLhAfter?.jsTransferSizeBytes)} | ${improvement(dashboardLhBefore?.jsTransferSizeBytes, dashboardLhAfter?.jsTransferSizeBytes, "bytes")} | Lighthouse total-byte-weight 기준으로는 개선 항목에서 제외 | docs/performance/raw/lighthouse-before.json, docs/performance/raw/lighthouse-after.json |

## 주요 개선 수치

${confirmedBullets.length ? confirmedBullets.map((item) => `- ${item}`).join("\n") : "- TODO: before/after 실제 측정값이 모두 있는 항목이 아직 없다."}

## raw 근거

- docs/performance/raw/bff-before.json
- docs/performance/raw/bff-after.json
- docs/performance/raw/large-list-current.json
- docs/performance/raw/a11y-before.json
- docs/performance/raw/a11y-after.json
- docs/performance/raw/lighthouse-before.json
- docs/performance/raw/lighthouse-after.json
- docs/performance/raw/bundle-before.json
- docs/performance/raw/bundle-after.json
- docs/performance/raw/stores-search-before.json
- docs/performance/raw/stores-search-after.json

## Lighthouse after baseline

| route | runs | Performance | LCP | TBT | CLS | Speed Index | requests |
| ----- | ---: | ----------: | --: | --: | --: | ----------: | -------: |
${lighthouseRows(lighthouseAfter)}
`,
  );
}

function lighthouseRows(raw) {
  const routes = raw?.routes ?? [];
  if (routes.length === 0) {
    return "| TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |";
  }

  return routes
    .map((route) => {
      const median = route.median ?? {};
      return `| ${route.route} | ${route.runCount} | ${formatValue(median.performanceScore)} | ${formatMs(median.lcpMs)} | ${formatMs(median.tbtMs)} | ${formatNumber(median.cls)} | ${formatMs(median.speedIndexMs)} | ${formatValue(median.requestCount)} |`;
    })
    .join("\n");
}

function routeResult(raw, route) {
  return raw?.results?.find((result) => result.route === route && result.status === "measured");
}

function listResult(count, variant) {
  return largeList?.results?.find(
    (result) => result.totalStoreCount === count && result.variant === variant,
  );
}

function a11yRoute(raw, route) {
  return raw?.results?.find((result) => result.route === route && result.status === "measured");
}

function a11yCount(row) {
  if (!row) {
    return undefined;
  }
  return (row.counts?.critical ?? 0) + (row.counts?.serious ?? 0);
}

function lighthouseRoute(raw, route) {
  return raw?.routes?.find((result) => result.route === route)?.median;
}

function bundleRoute(raw, route) {
  return raw?.routeSizes?.[route];
}

function storesSearchCount(raw) {
  return raw?.results?.find((result) => result.route === "/stores" && result.status === "measured")
    ?.apiStoreRequestCount;
}

function improved(before, after) {
  return isNumber(before) && isNumber(after) && before > after;
}

function improvement(before, after, unit = "") {
  if (!isNumber(before) || !isNumber(after) || before === 0) {
    return "TODO";
  }

  const diff = before - after;
  const percent = (diff / before) * 100;
  const sign = diff >= 0 ? "감소" : "증가";
  let value = Math.abs(diff).toFixed(1);
  if (unit === "bytes") {
    value = formatBytes(Math.abs(diff));
  } else if (unit === "ms") {
    value = formatMs(Math.abs(diff));
  } else if (unit) {
    value = `${Math.abs(diff).toFixed(0)}${unit}`;
  }
  return `${value} ${sign}, ${Math.abs(percent).toFixed(1)}%`;
}

function formatValue(value) {
  return isNumber(value) ? String(Math.round(value)) : "TODO";
}

function formatMs(value) {
  return isNumber(value) ? `${value.toFixed(1)}ms` : "TODO";
}

function formatBytes(value) {
  if (!isNumber(value)) {
    return "TODO";
  }
  return value < 1024 ? `${value.toFixed(0)} B` : `${(value / 1024).toFixed(1)} KB`;
}

function formatCompactBytes(value) {
  return formatBytes(value).replace(" ", "");
}

function formatCount(value) {
  return isNumber(value) ? Math.round(value).toLocaleString("en-US") : "TODO";
}

function formatNumber(value) {
  return isNumber(value) ? value.toFixed(3) : "TODO";
}

function isNumber(value) {
  return typeof value === "number" && Number.isFinite(value);
}

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function git(command) {
  try {
    return execSync(`git ${command}`, { cwd: repoRoot, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}
