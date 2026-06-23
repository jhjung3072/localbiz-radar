# LocalBiz Radar

소상공인 상가정보 OpenAPI/CSV 데이터를 활용한 상권 분석 서비스입니다. 지역·업종별 점포 탐색, 지도 기반 탐색, 후보 지역 비교, 데이터 동기화, 운영 모니터링 흐름을 한 프로젝트 안에서 검증합니다.

## 핵심 성과

| 영역 | 개선 내용 | 결과 |
| --- | --- | --- |
| 대량 목록 | TanStack Virtual로 보이는 row 중심 렌더링 | DOM 7,000개 -> 112개, 초기 렌더링 318.8ms -> 17.3ms |
| 초기 데이터 | Next.js BFF에서 Dashboard 데이터를 화면 단위로 조립 | `/api` 요청 5개 -> 1개, JS 전송량 744.8KB -> 425.7KB |
| 번들 | Recharts 차트를 dynamic import로 분리 | `/compare` route JS 572.9KB -> 181.6KB |
| 레이아웃 | 지도 skeleton과 목록 패널 높이 고정 | `/map` Lighthouse CLS 0.139 -> 0.000 |
| 오류 추적 | Sentry breadcrumb와 민감정보 scrubber 구성 | token, cookie, serviceKey 제거 테스트 |

성능 측정 근거: [docs/performance/frontend-performance-summary.md](./docs/performance/frontend-performance-summary.md)

## 기능

- 점포 탐색: 지역·업종·검색어 필터, URL 공유, 최근 검색어
- 지도 탐색: Kakao Maps marker, clustering, 지도 영역 재검색, 주변 점포 반경 검색
- 상권 분석: 점포 수, 업종 분포, 경쟁도, 지역 랭킹
- 후보 비교: 두 지역의 상권 지표 비교, chart, 공유 리포트
- 데이터 동기화: CSV/OpenAPI dry-run, upsert, sync log
- 운영: HttpOnly Cookie 관리자 인증, 운영 대시보드, Sentry 상태 확인

## 구현 포인트

- `@tanstack/react-virtual`로 점포 목록과 지도 하단 목록의 DOM 크기 제한
- Next.js Route Handler를 BFF로 사용해 Dashboard/Compare/Stores 초기 데이터 조립
- `next/dynamic`으로 chart chunk 분리
- Kakao Maps loading/error/empty 상태에서도 지도 영역 높이 유지
- Sentry event 전송 전 `authorization`, `cookie`, `token`, `serviceKey` 계열 값 제거
- Playwright, Lighthouse CI, bundle manifest 기반 성능 측정 스크립트 구성

## 기술 스택

- Frontend: Next.js App Router, React, TypeScript, Tailwind CSS
- Data/UI: TanStack Query, TanStack Table, TanStack Virtual, Recharts
- Map/Monitoring: Kakao Maps SDK, Sentry
- Backend: Java 21, Spring Boot, Spring Security, JPA, Flyway
- Infra/Test: PostgreSQL, Redis, Docker, Nginx, GitHub Actions, Playwright, Vitest, Lighthouse CI, axe

## 구조

```text
apps/web  Next.js frontend, BFF route, performance lab
apps/api  Spring Boot API, sync, auth, ops
docs      성능 측정 요약과 개발 문서
infra     Nginx, Prometheus, Grafana, Loki 설정
```

```text
Browser -> Next.js App Router/BFF -> Spring Boot API -> PostgreSQL
```

## 실행

```bash
pnpm install
docker compose up -d
pnpm dev:api
pnpm dev:web
```

- Web: `http://localhost:3000`
- API: `http://localhost:8080`
- Swagger: `http://localhost:8080/swagger-ui/index.html`

## 성능 측정

```bash
pnpm perf:measure
pnpm perf:large-list
pnpm perf:bundle
pnpm perf:lhci
pnpm perf:stores-search
```

## 검증

```bash
pnpm lint:web
pnpm build:web
pnpm test:web
pnpm e2e:web
cd apps/api && ./gradlew test
```
