import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const beforePath = path.join(repoRoot, "docs/performance/raw/a11y-before.json");
const rawPath = path.join(repoRoot, "docs/performance/raw/a11y-current.json");
const afterPath = path.join(repoRoot, "docs/performance/raw/a11y-after.json");
const reportPath = path.join(repoRoot, "docs/performance/04-a11y-report.md");
const beforeRaw = readJson(beforePath);
const raw = readJson(afterPath) ?? readJson(rawPath);
const gitRef = git("rev-parse --short HEAD") ?? "HEAD";

fs.mkdirSync(path.dirname(reportPath), { recursive: true });

const beforeRows = beforeRaw?.results ?? [];
const afterRows = raw?.results ?? [];
const beforeTotalCriticalSerious = beforeRows.reduce(
  (sum, row) => sum + (row.counts?.critical ?? 0) + (row.counts?.serious ?? 0),
  0,
);
const afterTotalCriticalSerious = afterRows.reduce(
  (sum, row) => sum + (row.counts?.critical ?? 0) + (row.counts?.serious ?? 0),
  0,
);
const beforeStores = beforeRows.find((row) => row.route === "/stores");
const afterStores = afterRows.find((row) => row.route === "/stores");

fs.writeFileSync(
  reportPath,
  `# 접근성 violation before/after

## 1. 측정 대상

주요 route의 axe accessibility violation 수. 확정 개선 대상은 /stores scrollable-region-focusable serious violation이다.

## 2. Before 기준

${gitRef} 기반 working tree, 점포 목록 스크롤 컨테이너 focus 보정 전.

## 3. After 기준

after: ${gitRef} 기반 working tree, 점포 목록 스크롤 컨테이너 focus 보정 후.

## 4. Before 구조 설명

스크롤 가능한 점포 목록 영역이 keyboard focus를 받을 수 없어 axe scrollable-region-focusable serious violation이 발생했다.

## 5. After 구조 설명

점포 목록 스크롤 컨테이너에 tabIndex, role="region", aria-label, focus ring을 추가했다.

## 6. 적용된 개선 방식

Scrollable region keyboard focus 보정.

## 7. 관련 변경 파일

- apps/web/e2e/a11y-performance-report.spec.ts
- apps/web/scripts/performance/summarize-a11y.mjs
- apps/web/src/features/stores/components/virtualized-store-list.tsx

## 8. 측정 지표

critical, serious, moderate, minor violation 수.

## 9. Before 수치

| route | status | critical | serious | moderate | minor | violation ids |
| ----- | ------ | -------: | ------: | -------: | ----: | ------------- |
${beforeRows.map(formatRow).join("\n") || "| TODO | failed | TODO | TODO | TODO | TODO | TODO |"}

## 10. After 수치

| route | status | critical | serious | moderate | minor | violation ids |
| ----- | ------ | -------: | ------: | -------: | ----: | ------------- |
${afterRows.map(formatRow).join("\n") || "| TODO | failed | TODO | TODO | TODO | TODO | TODO |"}

## 11. 개선 폭

/stores critical/serious violation ${countCriticalSerious(beforeStores)}건 → ${countCriticalSerious(afterStores)}건.

## 12. raw JSON 근거 파일 경로

- docs/performance/raw/a11y-before.json
- docs/performance/raw/a11y-after.json
- docs/performance/raw/a11y-current.json

## 13. 주요 개선 수치

- /stores axe critical/serious accessibility violation ${countCriticalSerious(beforeStores)}건 → ${countCriticalSerious(afterStores)}건

## 14. 측정 해석

가상화 목록의 스크롤 컨테이너가 keyboard focus를 받을 수 없던 문제를 axe baseline으로 식별하고, 명시적인 focus 가능한 region으로 보정한 뒤 재측정했습니다.

## 15. 측정 한계와 주의사항

전체 critical/serious 합계는 ${beforeTotalCriticalSerious}건 → ${afterTotalCriticalSerious}건이다. 자동 검사는 수동 keyboard 탐색을 완전히 대체하지 않는다.
`,
);

function formatRow(row) {
  const ids = row.violationIds?.length ? row.violationIds.join(", ") : "-";
  return `| ${row.route} | ${row.status} | ${row.counts?.critical ?? 0} | ${row.counts?.serious ?? 0} | ${row.counts?.moderate ?? 0} | ${row.counts?.minor ?? 0} | ${ids} |`;
}

function countCriticalSerious(row) {
  return row ? (row.counts?.critical ?? 0) + (row.counts?.serious ?? 0) : "TODO";
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
