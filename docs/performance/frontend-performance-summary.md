# 프론트엔드 성능 측정 summary

| 개선 항목 | Before | After | 개선 폭 | 개선 방식 | 근거 파일 |
| --------- | -----: | ----: | ------: | --------- | --------- |
| Dashboard API 요청 수 | 5 | 1 | 4.0 감소, 80.0% | BFF aggregate | docs/performance/raw/bff-before.json, docs/performance/raw/bff-after.json |
| 1000개 목록 DOM node 수 | 7000 | 112 | 6888.0 감소, 98.4% | Virtualized list | docs/performance/raw/large-list-current.json |
| `/stores` critical/serious a11y violation | 1 | 0 | 1건 감소, 100.0% | scrollable region focus 보정 | docs/performance/raw/a11y-before.json, docs/performance/raw/a11y-after.json |
| `/map` Lighthouse CLS | 0.139 | 0.000 | 0.139 감소, 0.1 이하 달성 | map skeleton/container/list panel 높이 안정화 | docs/performance/raw/lighthouse-before.json, docs/performance/raw/lighthouse-after.json |
| `/compare` route JS bundle | 572.9 KB | 181.6 KB | 391.3 KB 감소, 68.3% | Recharts chart dynamic import | docs/performance/raw/bundle-before.json, docs/performance/raw/bundle-after.json |
| `/stores` 검색 browser `/api/stores` 호출 수 | 6 | 1 | 5회 감소, 83.3% | 입력 중 자동 query 반영 제거, submit 시점 요청 | docs/performance/raw/stores-search-before.json, docs/performance/raw/stores-search-after.json |

## 개선되지 않은 추적 지표

| 추적 지표 | Before | After | 변화 | 해석 | 근거 파일 |
| --------- | -----: | ----: | ---: | ---- | --------- |
| Dashboard BFF LCP | 72.0ms | 364.0ms | 292.0ms 증가 | 개선 항목 아님. BFF LCP 개선 문장에 사용하지 않음 | docs/performance/raw/bff-before.json, docs/performance/raw/bff-after.json |
| Dashboard Lighthouse JS transfer | 554.8 KB | 564.8 KB | 10.0 KB 증가 | Lighthouse total-byte-weight 기준으로는 개선 항목에서 제외 | docs/performance/raw/lighthouse-before.json, docs/performance/raw/lighthouse-after.json |

## 주요 개선 수치

- Dashboard `/api` 요청 수 5개 → 1개, JS transfer 744.8KB → 425.7KB
- mock 1,000개 목록 DOM node 수 7,000개 → 112개, initial render 318.8ms → 17.3ms
- `/stores` axe critical/serious accessibility violation 1건 → 0건
- `/map` Lighthouse CLS 0.139 → 0.000으로 낮춰 0.1 이하 기준 달성
- `/compare` route JS bundle size 572.9KB → 181.6KB
- `/stores` 검색 입력 시 browser `/api/stores` 호출 수 6회 → 1회

## 확정 개선 항목 상세

### 1. Dashboard BFF 개선

Before에서는 browser가 dashboard 초기 데이터 관련 Spring Boot API를 여러 번 직접 호출했다. After에서는 Next.js Server Component/BFF 계층에서 bootstrap data를 조립해 client view에 전달한다. 이 때문에 브라우저 Network에서 `/bff/**` 요청이 늘어나는 것이 아니라, browser `/api/**` 요청이 줄어드는 방식으로 효과가 나타난다.

측정 결과 Dashboard 초기 browser `/api` 요청 수는 5개에서 1개로 감소했고, JS transfer size는 744.8 KB에서 425.7 KB로 감소했다. LCP는 72.0ms에서 364.0ms로 증가했으므로 LCP 개선이라고 표현하지 않는다.

### 2. 대량 목록 가상화 개선

Before에서는 mock 점포 1,000개 row를 모두 DOM에 렌더링했다. After에서는 TanStack Virtual로 viewport 주변 16개 row만 렌더링했다. 전체 데이터는 유지하지만 브라우저가 관리하는 DOM node 수를 줄여 initial render 부담을 낮춘 구조다.

측정 결과 mock 점포 1,000개 기준 목록 DOM node 수는 7,000개에서 112개로 감소했고, initial render는 318.8ms에서 17.3ms로 개선됐다. 이 수치는 실제 운영 DB가 아니라 deterministic mock dataset 기준이다.

### 3. `/stores` 접근성 개선

Before `/stores` axe 측정에서 `scrollable-region-focusable` serious 1건이 발견됐다. 점포 목록 가상 스크롤 컨테이너에 `tabIndex`, `role="region"`, `aria-label`, focus ring을 추가해 키보드 사용자가 스크롤 가능한 영역에 진입할 수 있도록 보정했다.

After 측정에서 `/stores` critical/serious violation은 1건에서 0건으로 감소했다.

### 4. `/map` CLS 개선

Before Lighthouse median에서 `/map` CLS는 0.1388117781로 0.1 기준을 넘었다. Suspense fallback이 실제 지도/패널 레이아웃보다 작고, 지도 하단 목록 패널이 loading/error/empty 상태에 따라 높이를 바꿀 수 있었다.

After에서는 map page skeleton을 실제 grid 구조에 맞추고, 지도 목록과 주변 점포 패널에 고정 높이와 최소 높이를 부여했다. Kakao Maps error 상태도 520px 지도 컨테이너 안에서 렌더링하도록 맞췄다. After Lighthouse median CLS는 0.000으로 측정됐다.

### 5. `/compare` bundle 개선

Before bundle manifest 기준 `/compare` route JS size는 572.9 KB였다. `ComparisonChart`, `ComparisonRadarChart`가 Recharts를 정적 import하면서 비교 화면 초기 client bundle에 chart code가 함께 포함됐다.

After에서는 두 chart 컴포넌트를 `next/dynamic`으로 분리하고, 같은 높이의 chart fallback을 제공했다. After bundle manifest 기준 `/compare` route JS size는 181.6 KB로 감소했다. 같은 변경으로 `/dashboard` route JS size도 504.1 KB에서 153.3 KB로 감소했지만, Lighthouse total-byte-weight 기준 Dashboard JS transfer는 증가했으므로 주요 수치는 `/compare` route bundle size 중심으로 정리한다.

### 6. `/stores` 검색 입력 API 호출 수 개선

Before에서는 검색어 입력값을 450ms debounce 후 URL query에 자동 반영했다. 사용자가 `coffee`를 600ms 간격으로 입력하면 중간 keyword인 `c`, `co`, `cof`, `coff`, `coffe`, `coffee`마다 browser `/api/stores` 요청이 발생했다.

After에서는 입력 중에는 local input state만 갱신하고, Enter 또는 검색 버튼 submit 시점에만 URL query와 React Query key를 변경하도록 바꿨다. 같은 측정 시나리오에서 browser `/api/stores` 요청 수는 6회에서 1회로 감소했다.

## 개선 항목에서 제외한 표현

- BFF LCP 개선: 이번 BFF before/after 측정에서 LCP는 증가했으므로 반복 측정 또는 별도 렌더링 개선이 필요하다.
- Dashboard Lighthouse JS transfer 개선: chart dynamic import 후 route manifest size는 줄었지만 Lighthouse total-byte-weight는 554.8 KB → 564.8 KB로 증가했다.

## 측정 해석

이번 리포트는 request 수, DOM node 수, a11y violation, CLS, route bundle size, 검색 interaction API 호출 수를 각각 raw JSON으로 남겼습니다. BFF는 browser `/api` 요청 감소와 JS transfer 감소로 설명하고, LCP 개선으로 포장하지 않습니다. 대량 목록은 deterministic mock dataset 기준이며, `/stores` 검색 호출 수는 “초기 로드 후 600ms 간격으로 `coffee` 입력 후 Enter”라는 고정 시나리오에서 측정했습니다.

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
| / | 5 | 100 | 734.5ms | 0.0ms | 0.000 | 206.9ms | 51 |
| /admin/login | 5 | 99 | 943.5ms | 0.0ms | 0.000 | 298.6ms | 51 |
| /compare | 5 | 100 | 777.3ms | 0.0ms | 0.000 | 245.5ms | 58 |
| /dashboard | 5 | 100 | 735.5ms | 0.0ms | 0.000 | 498.4ms | 53 |
| /map | 5 | 99 | 856.2ms | 0.0ms | 0.000 | 245.5ms | 62 |
| /stores | 5 | 97 | 1201.4ms | 0.0ms | 0.044 | 349.6ms | 66 |
