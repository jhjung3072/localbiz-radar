import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../..");
const rawDir = path.join(repoRoot, "docs/performance/raw");
const reportPath = path.join(repoRoot, "docs/performance/01-bff-before-after.md");
const before = readJson(path.join(rawDir, "bff-before.json"));
const after = readJson(path.join(rawDir, "bff-after.json"));
const currentRef = git("rev-parse --short HEAD") ?? "HEAD";
const routes = ["/dashboard", "/compare", "/stores"];

fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, buildReport());

function buildReport() {
  const dashboardBefore = routeResult(before, "/dashboard");
  const dashboardAfter = routeResult(after, "/dashboard");
  const requestBullet =
    dashboardBefore && dashboardAfter
      ? `- Dashboard 기준 브라우저 /api 요청 수를 ${dashboardBefore.apiRequestCount}개에서 ${dashboardAfter.apiRequestCount}개로 줄이고 JS transfer size를 ${formatBytes(dashboardBefore.browserMetrics?.jsTransferSizeBytes)}에서 ${formatBytes(dashboardAfter.browserMetrics?.jsTransferSizeBytes)}로 축소`
      : "- TODO: backend 실행 상태에서 before/after 측정이 모두 필요하다.";
  const lcpNote =
    dashboardBefore && dashboardAfter
      ? `Dashboard LCP는 ${formatMs(dashboardBefore.browserMetrics?.lcpMs)} → ${formatMs(dashboardAfter.browserMetrics?.lcpMs)}로 측정되어 이번 단일 Playwright 측정만으로 LCP 개선이라고 쓰지 않는다.`
      : "Dashboard LCP는 TODO다.";

  return `# BFF 적용 전/후 성능 비교

## 1. 측정 대상

/dashboard, /compare, /stores의 브라우저 request 수와 초기 렌더링 지표.

## 2. Before 기준 git ref

${before?.gitRef ?? "e224462"}

## 3. After 기준 git ref

${after?.gitRef ? `after: ${after.gitRef}, 측정 당시 HEAD` : `after: ${currentRef}, 측정 당시 HEAD`}

raw JSON의 \`gitRef\`도 03cb87a로 정규화했다. 초기 측정 스크립트는 after ref를 \`HEAD\`로 받았지만, 측정 당시 \`HEAD\`가 가리키던 commit은 03cb87a였다.

## 4. Before 구조 설명

BFF 적용 전에는 브라우저가 Spring Boot /api/** endpoint를 직접 여러 번 호출했다. before ref에는 /bff/** route가 없을 수 있으며, 이는 정상적인 before 상태다.

## 5. After 구조 설명

BFF 적용 후에는 Server Component와 Next.js Route Handler/server helper가 화면 단위 bootstrap 데이터를 조립한다. 초기 렌더링 데이터 일부는 브라우저 요청 대신 Next.js 서버에서 Spring Boot API를 호출해 준비한다.

## 6. 적용된 개선 방식

Next.js BFF aggregate, Server Component 초기 데이터 조립, React Query 초기 캐시 구성.

## 7. 관련 변경 파일

- apps/web/src/app/bff/**
- apps/web/src/features/bff/**
- apps/web/src/features/dashboard/server/get-dashboard-bootstrap.ts
- apps/web/src/features/compare/server/get-compare-bootstrap.ts
- apps/web/src/features/explore/server/get-stores-bootstrap.ts
- apps/web/src/app/dashboard/page.tsx
- apps/web/src/app/compare/page.tsx
- apps/web/src/app/stores/page.tsx

## 8. 측정 지표

LCP, TBT, CLS, JS transfer size, /api/** 요청 수, /bff/** 요청 수, 초기 화면 완료 시간, network waterfall 시간.

## 9. Before 수치

| route | /api 요청 | /bff 요청 | 전체 요청 | LCP | TBT | CLS | JS transfer |
| ----- | --------: | --------: | --------: | --: | --: | --: | ----------: |
${routes.map((route) => metricRow(routeResult(before, route))).join("\n")}

## 10. After 수치

| route | /api 요청 | /bff 요청 | 전체 요청 | LCP | TBT | CLS | JS transfer |
| ----- | --------: | --------: | --------: | --: | --: | --: | ----------: |
${routes.map((route) => metricRow(routeResult(after, route))).join("\n")}

## 11. 개선 폭

| route | /api 요청 변화 | 전체 요청 변화 | JS transfer 변화 | LCP 변화 |
| ----- | --------------: | -------------: | ---------------: | -------: |
${routes.map(improvementRow).join("\n")}

## 12. raw JSON 근거 파일 경로

- docs/performance/raw/bff-before.json
- docs/performance/raw/bff-after.json

## 13. 주요 개선 수치

${requestBullet}

주의: ${lcpNote}

## 14. 측정 해석

Dashboard, Compare, Stores는 BFF 적용 전 브라우저가 여러 /api endpoint를 직접 호출하던 흐름이었다. BFF와 Server Component 적용 후에는 초기 화면 데이터 일부를 Next.js 서버에서 조립해 브라우저 request와 JS transfer를 줄였다. 다만 LCP는 로컬 단일 브라우저 측정에서 개선으로 확인되지 않았으므로 Lighthouse median 또는 반복 측정 결과가 확보되기 전에는 LCP 개선이라고 표현하지 않는다.

## 15. 측정 한계와 주의사항

이번 BFF 수집은 Playwright browser Performance API 기반 단일 실행값이다. Lighthouse median과 다를 수 있으며, backend seed data, local machine 부하, Next standalone 실행 경고의 영향을 받을 수 있다. serviceKey, JWT, cookie, Sentry token은 로그에 남기지 않았다.

## git log / diff 근거

\`\`\`text
${gitLog("e224462..HEAD")}
\`\`\`

\`\`\`text
${gitDiffStat("e224462..HEAD")}
\`\`\`
`;
}

function metricRow(result) {
  if (!result) {
    return "| TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |";
  }

  return `| ${result.route} | ${formatValue(result.apiRequestCount)} | ${formatValue(result.bffRequestCount)} | ${formatValue(result.requestCount)} | ${formatMs(result.browserMetrics?.lcpMs)} | ${formatMs(result.browserMetrics?.tbtMs)} | ${formatNumber(result.browserMetrics?.cls)} | ${formatBytes(result.browserMetrics?.jsTransferSizeBytes)} |`;
}

function improvementRow(route) {
  const beforeResult = routeResult(before, route);
  const afterResult = routeResult(after, route);
  return `| ${route} | ${improvement(beforeResult?.apiRequestCount, afterResult?.apiRequestCount)} | ${improvement(beforeResult?.requestCount, afterResult?.requestCount)} | ${improvement(beforeResult?.browserMetrics?.jsTransferSizeBytes, afterResult?.browserMetrics?.jsTransferSizeBytes, "bytes")} | ${improvement(beforeResult?.browserMetrics?.lcpMs, afterResult?.browserMetrics?.lcpMs, "ms")} |`;
}

function routeResult(raw, route) {
  return raw?.results?.find((result) => result.route === route && result.status === "measured");
}

function improvement(beforeValue, afterValue, unit = "") {
  if (!isNumber(beforeValue) || !isNumber(afterValue) || beforeValue === 0) {
    return "TODO";
  }

  const diff = beforeValue - afterValue;
  const percent = (diff / beforeValue) * 100;
  const sign = diff >= 0 ? "감소" : "증가";
  const value = unit === "bytes" ? formatBytes(Math.abs(diff)) : unit === "ms" ? formatMs(Math.abs(diff)) : Math.abs(diff).toFixed(1);
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

function gitLog(range) {
  return git(`log --oneline ${range}`) || "TODO";
}

function gitDiffStat(range) {
  return git(`diff --stat ${range}`) || "TODO";
}
