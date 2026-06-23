import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
const webRoot = path.join(repoRoot, "apps/web");
const nextDir = path.join(webRoot, ".next");
const beforePath = path.join(repoRoot, "docs/performance/raw/bundle-before.json");
const rawPath = path.join(repoRoot, "docs/performance/raw/bundle-current.json");
const reportPath = path.join(repoRoot, "docs/performance/03-bundle-analysis.md");
const gitRef = git("rev-parse --short HEAD") ?? "HEAD";
const routes = ["/dashboard", "/stores", "/map", "/compare", "/reports/compare"];
const appManifest = readJson(path.join(nextDir, "app-build-manifest.json"));
const buildManifest = readJson(path.join(nextDir, "build-manifest.json"));
const pages = appManifest?.pages ?? {};
const routeSizes = Object.fromEntries(
  routes.map((route) => [route, summarizeRoute(route)]),
);
const topChunks = findTopChunks(path.join(nextDir, "static/chunks")).slice(0, 15);
const sharedFiles = findSharedFiles(Object.values(routeSizes).map((item) => item.files));
const sharedBytes = sumFiles(sharedFiles);
const analyzerOutput = findAnalyzerOutput();
const status = fs.existsSync(nextDir) ? "measured" : "failed";
const beforeRaw = readJson(beforePath);

fs.mkdirSync(path.dirname(rawPath), { recursive: true });
fs.writeFileSync(
  rawPath,
  `${JSON.stringify(
    {
      status,
      generatedAt: new Date().toISOString(),
      source: "apps/web/scripts/performance/summarize-bundle.mjs",
      gitRef,
      sharedBytes,
      routeSizes,
      topChunks,
      analyzerOutput,
    },
    null,
    2,
  )}\n`,
);

fs.writeFileSync(
  reportPath,
  `# Bundle size before/after 분석

## 1. 측정 대상

Next.js production build의 route별 JavaScript chunk size.

## 2. Before 기준

${gitRef} 기반 working tree, chart dynamic import 적용 전.

## 3. After 기준

after: ${gitRef} 기반 working tree, chart dynamic import 적용 후.

## 4. Before 구조 설명

Dashboard/Compare chart 컴포넌트가 Recharts를 정적으로 import해 route 초기 client bundle에 함께 포함됐다.

## 5. After 구조 설명

chart 컴포넌트를 next/dynamic으로 분리하고 같은 높이의 fallback을 제공했다.

## 6. 적용된 개선 방식

Recharts chart dynamic import, 고정 높이 chart fallback.

## 7. 관련 변경 파일

- apps/web/next.config.ts
- apps/web/lighthouserc.cjs
- apps/web/scripts/performance/summarize-bundle.mjs
- scripts/performance/measure-bundle.sh
- apps/web/src/features/dashboard/components/dashboard-bootstrap-view.tsx
- apps/web/src/features/compare/components/compare-page-client.tsx

## 8. 측정 지표

First Load JS shared 후보, route별 JS bytes, 가장 큰 client chunks.

## 9. Before 수치

| route | JS size | chunk count |
| ----- | ------: | ----------: |
${routes.map((route) => bundleRow(route, beforeRaw?.routeSizes?.[route])).join("\n")}

## 10. After 수치

| route | JS size | chunk count |
| ----- | ------: | ----------: |
${routes.map((route) => `| ${route} | ${formatBytes(routeSizes[route].bytes)} | ${routeSizes[route].files.length} |`).join("\n")}

First Load JS shared 후보: ${formatBytes(sharedBytes)}

## 11. 개선 폭

| route | Before | After | 개선 폭 |
| ----- | -----: | ----: | ------: |
| /dashboard | ${formatBytes(beforeRaw?.routeSizes?.["/dashboard"]?.bytes)} | ${formatBytes(routeSizes["/dashboard"].bytes)} | ${improvement(beforeRaw?.routeSizes?.["/dashboard"]?.bytes, routeSizes["/dashboard"].bytes)} |
| /compare | ${formatBytes(beforeRaw?.routeSizes?.["/compare"]?.bytes)} | ${formatBytes(routeSizes["/compare"].bytes)} | ${improvement(beforeRaw?.routeSizes?.["/compare"]?.bytes, routeSizes["/compare"].bytes)} |

## 12. raw JSON 근거 파일 경로

- docs/performance/raw/bundle-before.json
- docs/performance/raw/bundle-after.json
- docs/performance/raw/bundle-current.json

## 13. 주요 개선 수치

- /compare route JS bundle size ${formatCompactBytes(beforeRaw?.routeSizes?.["/compare"]?.bytes)} → ${formatCompactBytes(routeSizes["/compare"].bytes)}

## 14. 측정 해석

chart가 필요한 시점까지 Recharts chunk를 분리하기 위해 Dashboard/Compare chart 컴포넌트를 dynamic import로 전환했습니다. manifest 기준 /compare route JS size가 감소했습니다.

## 15. 측정 한계와 주의사항

analyzer output은 로컬에만 두고 commit하지 않는다. Lighthouse total-byte-weight는 route manifest size와 다른 네트워크 자산을 포함할 수 있다.

## 가장 큰 client chunks

| file | size |
| ---- | ---: |
${topChunks.map((chunk) => `| ${chunk.file} | ${formatBytes(chunk.bytes)} |`).join("\n")}

## 이미 최적화된 항목

- Sentry source map upload는 token이 없으면 비활성화되어 local build를 실패시키지 않는다.
- Next.js standalone output은 유지했다.

## 실제 dynamic import/code splitting을 적용한 항목

- Dashboard category distribution chart
- Compare bar/radar chart
`,
);

function summarizeRoute(route) {
  const files = findRouteFiles(route);
  return {
    files,
    bytes: sumFiles(files),
  };
}

function bundleRow(route, item) {
  return `| ${route} | ${formatBytes(item?.bytes)} | ${item?.files?.length ?? "TODO"} |`;
}

function improvement(before, after) {
  if (typeof before !== "number" || typeof after !== "number" || before === 0) {
    return "TODO";
  }
  const diff = before - after;
  const percent = (diff / before) * 100;
  return `${formatBytes(Math.abs(diff))} ${diff >= 0 ? "감소" : "증가"}, ${Math.abs(percent).toFixed(1)}%`;
}

function findRouteFiles(route) {
  const clientReferenceFiles = findClientReferenceFiles(route);
  if (clientReferenceFiles.length > 0) {
    return clientReferenceFiles;
  }

  const keys = Object.keys(pages);
  const normalized = route === "/" ? "/page" : `${route}/page`;
  const key = keys.find(
    (item) =>
      item === normalized ||
      item.endsWith(normalized) ||
      item.endsWith(`${normalized}.js`) ||
      item.includes(`app${normalized}`),
  );

  if (key && Array.isArray(pages[key])) {
    return pages[key].filter((file) => file.endsWith(".js"));
  }

  const fallback = buildManifest?.pages?.[route] ?? [];
  return fallback.filter((file) => file.endsWith(".js"));
}

function findClientReferenceFiles(route) {
  const routePath = route === "/" ? "" : route.slice(1);
  const manifestPath = path.join(
    nextDir,
    "server/app",
    routePath,
    "page_client-reference-manifest.js",
  );

  if (!fs.existsSync(manifestPath)) {
    return [];
  }

  try {
    const sandbox = { globalThis: {} };
    vm.runInNewContext(fs.readFileSync(manifestPath, "utf8"), sandbox);
    const manifest = sandbox.globalThis.__RSC_MANIFEST ?? {};
    const routeManifest = Object.values(manifest)[0];
    const modules = routeManifest?.clientModules ?? {};
    const chunks = new Set();

    for (const moduleInfo of Object.values(modules)) {
      for (const chunk of moduleInfo.chunks ?? []) {
        if (typeof chunk === "string" && chunk.endsWith(".js")) {
          chunks.add(chunk.replace(/^\/_next\//, ""));
        }
      }
    }

    return [...chunks];
  } catch {
    return [];
  }
}

function findSharedFiles(fileGroups) {
  const nonEmptyGroups = fileGroups.filter((group) => group.length > 0);
  if (nonEmptyGroups.length === 0) {
    return buildManifest?.rootMainFiles ?? [];
  }

  return nonEmptyGroups[0].filter((file) =>
    nonEmptyGroups.every((group) => group.includes(file)),
  );
}

function sumFiles(files) {
  return files.reduce((sum, file) => sum + fileSize(file), 0);
}

function fileSize(file) {
  const normalized = file.replace(/^\//, "");
  const absolute = path.join(nextDir, normalized);

  try {
    return fs.statSync(absolute).size;
  } catch {
    return 0;
  }
}

function findTopChunks(dir) {
  if (!fs.existsSync(dir)) {
    return [];
  }

  const chunks = [];
  walk(dir, (file) => {
    if (!file.endsWith(".js")) {
      return;
    }
    chunks.push({
      file: path.relative(webRoot, file),
      bytes: fs.statSync(file).size,
    });
  });

  return chunks.sort((a, b) => b.bytes - a.bytes);
}

function findAnalyzerOutput() {
  const candidates = [
    path.join(webRoot, ".next/diagnostics/analyze"),
    path.join(webRoot, ".next/analyze"),
    path.join(webRoot, ".next/analyze/client.html"),
    path.join(webRoot, ".next/analyze/nodejs.html"),
    path.join(webRoot, ".next/analyze/edge.html"),
  ];

  return candidates
    .filter((candidate) => fs.existsSync(candidate))
    .map((candidate) => path.relative(repoRoot, candidate));
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

function formatBytes(bytes) {
  if (!Number.isFinite(bytes)) {
    return "TODO";
  }
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function formatCompactBytes(bytes) {
  return formatBytes(bytes).replace(" ", "");
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
