# 프론트엔드 품질 고도화

## 기능 개요

이번 단계에서는 LocalBiz Radar 프론트엔드의 품질 검증 기반을 정리했다. 주요 UI 컴포넌트는 Storybook에서 API 호출 없이 확인하고, 핵심 사용자 흐름은 Playwright E2E 테스트로 검증한다.

새로운 백엔드 API, Next.js BFF, 공공데이터 OpenAPI 호출 로직은 추가하지 않았다. 프론트엔드는 계속 Spring Boot API만 호출한다.

## Storybook 구성

Storybook 설정 위치:

- `apps/web/.storybook/main.ts`
- `apps/web/.storybook/preview.tsx`

실행:

```bash
pnpm storybook:web
pnpm build-storybook:web
```

Storybook은 실제 Spring Boot API를 호출하지 않는다. API client를 직접 사용하는 page component보다 presentation component 중심으로 story를 작성하고, 필요한 데이터는 mock props로 전달한다.

작성된 story:

- `AppShell`
- `PageHeader`
- `MetricCard`
- `SectionCard`
- `LoadingState`
- `ErrorState`
- `EmptyState`
- `LoginForm`
- `StoreTable`
- `WinnerInsightCard`
- `ComparisonSummaryCards`
- `SyncResultCard`

## Playwright E2E 테스트

설정 위치:

- `apps/web/playwright.config.ts`
- `apps/web/e2e/`

첫 실행 전 Chromium 설치:

```bash
pnpm --filter web exec playwright install chromium
```

실행:

```bash
pnpm e2e:web
pnpm --filter web e2e:ui
pnpm --filter web e2e:headed
```

테스트는 browser route mock으로 Spring Boot API 응답을 대체한다. 따라서 CI나 로컬 E2E에서 공공데이터 OpenAPI, Kakao 외부 API 동기화, 관리자 데이터 반영 작업을 실행하지 않는다.

테스트 시나리오:

- `public-pages.spec.ts`: `/`, `/dashboard`, `/stores`, `/analysis`, `/compare`, `/map` 공개 페이지 smoke test
- `admin-auth.spec.ts`: `/data-sync` 보호, 관리자 로그인, 잘못된 로그인, logout, token storage 미사용 검증
- `stores.spec.ts`: 점포 검색 input, table 또는 결과 UI 확인
- `compare.spec.ts`: 기준 지역/비교 지역 cascading select와 비교 결과 확인
- `a11y.spec.ts`: `/`, `/stores`, `/compare`, `/admin/login`의 critical/serious 접근성 위반 검증

## 접근성 개선 기준

점검 기준:

- 페이지마다 의미 있는 `h1`을 둔다.
- form input과 select에는 label 또는 접근 가능한 이름을 연결한다.
- icon-only button에는 `aria-label`을 둔다.
- table에는 caption을 제공한다.
- chart는 screen reader가 읽을 수 있는 텍스트 요약을 함께 제공한다.
- loading/error/empty 상태는 `role`과 `aria-live`로 상태 변화를 알린다.
- 색상만으로 상태를 전달하지 않는다.
- disabled control도 충분한 명도 대비를 유지한다.

자동 접근성 테스트는 `@axe-core/playwright`로 critical/serious 위반을 우선 검출한다. 모든 minor violation을 한 번에 강제하지 않고, 사용자 흐름에 영향을 주는 항목부터 개선한다.

## 공통 상태 UI 원칙

공통 컴포넌트 위치:

- `apps/web/src/components/common/loading-state.tsx`
- `apps/web/src/components/common/error-state.tsx`
- `apps/web/src/components/common/empty-state.tsx`
- `apps/web/src/components/common/page-header.tsx`
- `apps/web/src/components/common/metric-card.tsx`
- `apps/web/src/components/common/section-card.tsx`

loading/error/empty 상태는 화면마다 새로 만들기보다 공통 컴포넌트를 우선 사용한다. 사용자 문구는 한국어로 작성하고, retry button이나 link가 필요한 경우 명확한 텍스트를 제공한다.

## 로컬 테스트 순서

권장 순서:

```bash
pnpm install
pnpm lint:web
pnpm build:web
pnpm test:web
pnpm build-storybook:web
pnpm e2e:web
pnpm run ci
```

실제 backend 연동까지 브라우저에서 확인하려면 별도 터미널에서 다음을 실행한다.

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

관리자 보호 흐름은 `http://localhost:3000/data-sync`에 직접 접속해 `/admin/login?next=/data-sync` 이동, 로그인, 로그아웃을 확인한다.

## CI 적용 범위

현재 GitHub Actions web job은 다음을 실행한다.

- `pnpm install`
- `pnpm --filter web lint`
- `pnpm --filter web build`
- `pnpm --filter web test:run`
- `pnpm --filter web build-storybook`

Playwright E2E는 로컬 검증 중심으로 둔다. CI에 완전 자동화하려면 PostgreSQL, Spring Boot API, seed data, admin auth cookie 흐름을 안정적으로 준비해야 한다.

## 현재 한계

- E2E는 외부 OpenAPI와 Kakao SDK를 실제 호출하지 않는다.
- 관리자 데이터 동기화 버튼의 실제 반영 작업은 자동 테스트에서 제외한다.
- Storybook interaction test와 시각 회귀 테스트는 아직 추가하지 않았다.
- 접근성 자동 테스트는 critical/serious 위반 중심이다.

## 향후 개선 계획

- Storybook interaction test 추가
- Playwright trace와 report artifact 업로드
- CI 기반 E2E 완전 자동화
- 시각 회귀 테스트 도입
- Lighthouse 기반 성능 측정
- 실제 backend seed fixture 기반 통합 E2E 분리
