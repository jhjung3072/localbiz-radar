# Next.js BFF 계층

## 기능 개요

Next.js App Router의 Route Handler와 Server Component를 사용해 화면 초기 데이터 조립 계층을 추가했다. Spring Boot는 계속 비즈니스 API와 계산 로직을 담당하고, Next.js BFF는 화면별 bootstrap 데이터 조합, same-origin endpoint, HttpOnly Cookie forwarding, 초기 렌더링 최적화만 담당한다.

## 왜 Next.js를 사용하는가

React SPA만 사용하면 브라우저가 여러 API를 순차 호출하면서 초기 로딩 waterfall이 생긴다. LocalBiz Radar는 대시보드, 점포 탐색, 후보 비교, 관리자 운영 화면처럼 여러 API 응답을 한 화면에 조합하는 흐름이 많다.

Next.js를 사용하면 다음 장점이 생긴다.

- Server Component에서 화면 초기 데이터를 서버에서 조립한다.
- Route Handler로 `/bff/**` same-origin endpoint를 제공한다.
- HttpOnly Cookie를 JavaScript에서 읽지 않고 서버에서 Spring Boot로 forwarding한다.
- public 화면은 검색/필터 interaction을 유지하면서 첫 렌더링 데이터를 줄 수 있다.
- production Nginx에서 `/api/**`와 `/bff/**` 책임을 분리한다.

## 책임 범위

Next.js BFF 책임:

- 화면 단위 API 응답 조합
- Server Component 초기 데이터 fetch
- React Query `initialData` 전달
- admin BFF에서 Cookie header forwarding
- BFF 표준 `{ data }`, `{ error }` 응답 변환
- Sentry breadcrumb와 민감 정보 제거

Spring Boot 책임:

- Store/Region/Analysis/Map/Sync/Auth/Ops 비즈니스 API
- 공공데이터 OpenAPI 호출
- 관리자 인증과 refreshToken rotation
- 데이터베이스 조회와 분석 지표 계산

BFF에는 상권 점수 계산, 동기화 처리, 인증 token 발급 같은 비즈니스 로직을 넣지 않는다.

## Route Handler 구조

```text
apps/web/src/app/bff/
  dashboard/route.ts
  explore/bootstrap/route.ts
  stores/route.ts
  compare/bootstrap/route.ts
  admin/ops/route.ts
  admin/data-sync/route.ts

apps/web/src/features/bff/server/
  spring-api-client.ts
  bff-response.ts
  bff-error.ts
  cookie-forwarding.ts
  query-param.ts
  master-mapper.ts
  types.ts
```

## BFF route 목록

`GET /bff/dashboard`

- 호출: `/api/analysis/summary`, `/api/analysis/category-distribution`, `/api/analysis/region-ranking`
- 역할: 대시보드 summary, chart, 추천 랭킹 초기 데이터 조합

`GET /bff/explore/bootstrap`

- 호출: `/api/master/regions`, `/api/master/categories`
- 역할: `/stores`, `/map`, `/compare` 공통 필터용 지역/업종 마스터 조합

`GET /bff/stores`

- 호출: `/api/stores`, `/api/master/regions`, `/api/master/categories`
- 역할: 점포 목록, 필터 옵션, active filter label 메타데이터 조합

`GET /bff/compare/bootstrap`

- 호출: `/api/master/regions`, `/api/master/categories`, `/api/analysis/region-ranking`
- 역할: 후보 비교 화면의 cascading select와 추천 후보 지역 랭킹 초기화

`GET /bff/admin/ops`

- 호출: `/api/admin/ops/overview`, `/api/admin/ops/sync-summary`, `/api/admin/ops/data-quality`
- 역할: 관리자 운영 대시보드 초기 데이터 조합
- 인증: incoming Cookie header를 Spring Boot로 forwarding

`GET /bff/admin/data-sync`

- 호출: `/api/admin/sync/logs`, `/api/admin/sync/openapi/status`, `/api/admin/sync/master/status`
- 역할: 데이터 동기화 화면의 최근 로그와 설정 상태 초기화
- 인증: incoming Cookie header를 Spring Boot로 forwarding

## Server Component 초기 데이터 조립

다음 화면은 Server Component에서 BFF server helper를 호출하고, Client Component에 초기 데이터를 props로 전달한다.

- `/dashboard`
- `/stores`
- `/map`
- `/compare`
- `/admin/ops`
- `/data-sync`

Client Component는 전달받은 값을 React Query `initialData`로 사용한다. 이후 사용자가 필터를 바꾸거나 페이지를 이동하면 기존 client-side Spring API 호출을 유지한다.

## Cookie forwarding

관리자 인증은 기존 HttpOnly Cookie 기반 access/refresh token 방식을 유지한다.

1. 브라우저가 `/admin/ops` 또는 `/data-sync`에 접근한다.
2. Next.js Server Component가 request cookie를 읽는다.
3. BFF server helper가 Cookie header를 Spring Boot `/api/admin/**` 요청에 전달한다.
4. Spring Security가 기존 방식으로 accessToken cookie를 검증한다.
5. Spring Boot가 401을 반환하면 BFF도 401 또는 초기값 없음으로 처리한다.

token 값은 JavaScript에서 읽지 않는다. localStorage/sessionStorage에 저장하지 않는다.

## Caching 전략

현재 BFF Spring API fetch는 `cache: "no-store"`를 기본으로 사용한다. 데이터 동기화 직후 `/dashboard`, `/stores`, `/map`, `/compare`에 변경 사항이 바로 반영되는 것이 중요하기 때문이다.

마스터 데이터는 자주 바뀌지 않으므로 향후 `revalidateTag` 또는 긴 revalidate를 적용할 수 있다. 단, master sync 직후 stale data가 보일 수 있어 invalidation 전략이 함께 필요하다.

## Sentry 정책

BFF upstream 호출에는 다음 breadcrumb를 남긴다.

- `spring api fetch start`
- `spring api fetch succeeded`
- `spring api fetch failed`

breadcrumb에는 path와 status만 남긴다. Cookie, Authorization, Set-Cookie, 공공데이터 serviceKey, Sentry auth token은 로그, 응답, Sentry event에 포함하지 않는다.

## Nginx routing

production-like Nginx는 다음처럼 routing한다.

- `/api/**` -> Spring Boot API
- `/bff/**` -> Next.js web
- `/` -> Next.js web

이 경계를 유지해야 `/api/bff/**` 같은 충돌을 피할 수 있다.

## 테스트 방법

```bash
pnpm --filter web lint
pnpm --filter web test:run
pnpm --filter web build
pnpm --filter web e2e -- e2e/bff-flow.spec.ts
```

수동 확인:

- `http://localhost:3000/dashboard`
- `http://localhost:3000/stores`
- `http://localhost:3000/compare`
- `http://localhost:3000/admin/ops`
- `http://localhost:3000/data-sync`
- `http://localhost:3000/bff/admin/ops` 비로그인 401 확인

## 현재 한계

- BFF는 초기 데이터 조립에만 사용한다.
- 모든 Spring API를 proxy하지 않는다.
- admin login/refresh/logout은 기존 `/api/auth/**` 직접 호출을 유지한다.
- master data cache invalidation은 아직 tag 기반으로 분리하지 않았다.
- BFF route에서 streaming/Suspense 고도화는 아직 적용하지 않았다.

## 향후 개선 계획

- Server Actions 일부 도입
- streaming/Suspense 강화
- `revalidateTag` 기반 master cache invalidation
- admin API 전체 same-origin proxy
- middleware 기반 route protection
- OpenTelemetry trace propagation
