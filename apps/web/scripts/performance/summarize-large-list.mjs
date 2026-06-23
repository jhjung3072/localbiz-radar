import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const rawPath = path.join(repoRoot, "docs/performance/raw/large-list-current.json");
const reportPath = path.join(repoRoot, "docs/performance/02-large-list-mock-before-after.md");
const raw = readJson(rawPath);
const gitRef = git("rev-parse --short HEAD") ?? "HEAD";

fs.mkdirSync(path.dirname(reportPath), { recursive: true });

if (!raw?.results) {
  fs.writeFileSync(reportPath, buildMissingReport(raw, gitRef));
  process.exit(0);
}

const results = raw.results;
const counts = [100, 500, 1000, 2000];
const rows = counts.flatMap((count) => [
  findResult(count, "legacy"),
  findResult(count, "virtual"),
]);
const legacy1000 = findResult(1000, "legacy");
const virtual1000 = findResult(1000, "virtual");
const domImprovement = improvement(legacy1000?.listDomNodeCount, virtual1000?.listDomNodeCount);
const rowImprovement = improvement(legacy1000?.renderedRowCount, virtual1000?.renderedRowCount);
const initialImprovement = improvement(legacy1000?.initialRenderMs, virtual1000?.initialRenderMs);
const scrollImprovement = improvement(legacy1000?.scrollTestDurationMs, virtual1000?.scrollTestDurationMs);
const clickImprovement = improvement(legacy1000?.clickToDetailOpenMs, virtual1000?.clickToDetailOpenMs);

fs.writeFileSync(
  reportPath,
  `# 대량 목록 mock 성능 비교

## 1. 측정 대상

/perf/large-list route에서 100, 500, 1000, 2000개 mock 점포를 legacy 전체 렌더링과 virtualized list로 각각 렌더링했다.

## 2. Before 기준 git ref

${gitRef} 내부 legacy variant

## 3. After 기준 git ref

${gitRef} 내부 virtual variant

## 4. Before 구조 설명

legacy list는 모든 점포 row를 한 번에 DOM에 렌더링한다.

## 5. After 구조 설명

virtual list는 @tanstack/react-virtual로 viewport 주변 row만 DOM에 유지한다.

## 6. 적용된 개선 방식

mock dataset을 deterministic seed로 생성하고, legacy/virtual variant를 같은 route와 같은 데이터 조건에서 비교했다.

## 7. 관련 변경 파일

- apps/web/src/app/perf/large-list/page.tsx
- apps/web/src/features/performance/mock/create-mock-stores.ts
- apps/web/src/features/performance/components/legacy-store-list.tsx
- apps/web/src/features/performance/components/virtual-store-list.tsx
- apps/web/e2e/perf-large-list.spec.ts

## 8. 측정 지표

DOM node 수, rendered row 수, initial render ms, scroll duration, click-to-detail latency, React Profiler 참고값.

## 9. Before 수치

legacy variant 수치:

${tableForVariant("legacy")}

## 10. After 수치

virtual variant 수치:

${tableForVariant("virtual")}

## 11. 개선 폭

1000개 기준:

- 목록 DOM node 수: ${formatValue(legacy1000?.listDomNodeCount)} → ${formatValue(virtual1000?.listDomNodeCount)} (${domImprovement})
- rendered row 수: ${formatValue(legacy1000?.renderedRowCount)} → ${formatValue(virtual1000?.renderedRowCount)} (${rowImprovement})
- initial render: ${formatMs(legacy1000?.initialRenderMs)} → ${formatMs(virtual1000?.initialRenderMs)} (${initialImprovement})
- scroll duration: ${formatMs(legacy1000?.scrollTestDurationMs)} → ${formatMs(virtual1000?.scrollTestDurationMs)} (${scrollImprovement})
- click latency: ${formatMs(legacy1000?.clickToDetailOpenMs)} → ${formatMs(virtual1000?.clickToDetailOpenMs)} (${clickImprovement})

## 12. raw JSON 근거 파일 경로

docs/performance/raw/large-list-current.json

## 13. 주요 개선 수치

- mock 점포 1000개 기준 목록 DOM node 수를 ${formatValue(legacy1000?.listDomNodeCount)}개에서 ${formatValue(virtual1000?.listDomNodeCount)}개로 줄이도록 virtualized list 성능 Lab을 구현하고 Playwright로 렌더링/스크롤/상세 열기 지표를 자동 측정

## 14. 측정 해석

실제 운영 데이터가 아직 충분하지 않아서 deterministic mock 점포 100/500/1000/2000개를 만들고, 전체 DOM 렌더링과 viewport 기반 가상화를 같은 조건에서 비교했습니다. 핵심 수치는 React Profiler가 아니라 DOM node 수와 Performance API 기반 렌더링/스크롤/클릭 latency로 잡았습니다.

## 15. 측정 한계와 주의사항

mock route는 NEXT_PUBLIC_ENABLE_PERF_LAB=true일 때만 접근 가능하며 일반 navigation에 노출하지 않는다. Profiler 수치는 참고값이며 production 핵심 수치는 DOM/Performance API 기반이다. 실제 사용자 환경의 네트워크, 기기 성능, 지도 SDK 로딩 비용은 별도 측정이 필요하다.

## 전체 비교표

| 데이터 수 | 방식 | 전체 DOM node 수 | 목록 DOM node 수 | rendered row 수 | initial render | scroll duration | click latency |
| --------: | ---- | ---------------: | ---------------: | ---------------: | -------------: | --------------: | ------------: |
${rows.map((row) => tableRow(row)).join("\n")}
`,
);

function tableForVariant(variant) {
  return `| 데이터 수 | 전체 DOM node 수 | 목록 DOM node 수 | rendered row 수 | initial render | scroll duration | click latency |
| --------: | ---------------: | ---------------: | ---------------: | -------------: | --------------: | ------------: |
${counts.map((count) => tableRow(findResult(count, variant), false)).join("\n")}`;
}

function tableRow(result, includeVariant = true) {
  if (!result) {
    return includeVariant
      ? "| TODO | TODO | TODO | TODO | TODO | TODO | TODO | TODO |"
      : "| TODO | TODO | TODO | TODO | TODO | TODO | TODO |";
  }

  const cells = [
    result.totalStoreCount,
    ...(includeVariant ? [result.variant] : []),
    result.totalDomNodeCount,
    result.listDomNodeCount,
    result.renderedRowCount,
    formatMs(result.initialRenderMs),
    formatMs(result.scrollTestDurationMs),
    formatMs(result.clickToDetailOpenMs),
  ];

  return `| ${cells.join(" | ")} |`;
}

function findResult(count, variant) {
  return results.find(
    (result) => result.totalStoreCount === count && result.variant === variant,
  );
}

function improvement(before, after) {
  if (!isNumber(before) || !isNumber(after) || before === 0) {
    return "TODO";
  }

  const diff = before - after;
  const percent = (diff / before) * 100;
  const sign = diff >= 0 ? "감소" : "증가";
  return `${Math.abs(diff).toFixed(1)} ${sign}, ${Math.abs(percent).toFixed(1)}%`;
}

function formatMs(value) {
  return isNumber(value) ? `${value.toFixed(1)}ms` : "TODO";
}

function formatValue(value) {
  return isNumber(value) ? String(Math.round(value)) : "TODO";
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

function buildMissingReport(rawData, ref) {
  const reason = rawData?.reason ?? "측정 raw JSON이 아직 생성되지 않았다.";
  return `# 대량 목록 mock 성능 비교

## 1. 측정 대상

/perf/large-list legacy/virtual 비교.

## 2. Before 기준 git ref

${ref} 내부 legacy variant

## 3. After 기준 git ref

${ref} 내부 virtual variant

## 4. Before 구조 설명

legacy list는 모든 row를 렌더링한다.

## 5. After 구조 설명

virtual list는 보이는 row 중심으로 렌더링한다.

## 6. 적용된 개선 방식

TODO

## 7. 관련 변경 파일

TODO

## 8. 측정 지표

DOM node 수, rendered row 수, initial render, scroll duration, click latency.

## 9. Before 수치

TODO

## 10. After 수치

TODO

## 11. 개선 폭

TODO

## 12. raw JSON 근거 파일 경로

docs/performance/raw/large-list-current.json

## 13. 주요 개선 수치

TODO: 실제 수치가 필요하다.

## 14. 측정 해석

TODO

## 15. 측정 한계와 주의사항

${reason}
`;
}
