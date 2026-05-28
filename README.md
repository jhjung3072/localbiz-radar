# LocalBiz Radar

LocalBiz Radar는 공공 데이터를 기반으로 지역 상권을 탐색하고 비교하는 로컬 커머스 분석 대시보드입니다. 현재 단계에서는 개발용 seed data, CSV import, 제한된 OpenAPI 동기화를 Spring Boot API 뒤에 두고 점포 목록, 지도, 대시보드, 상권 분석 흐름을 검증합니다.

## 기술 스택

- 프론트엔드: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Table, Kakao Maps SDK
- 백엔드: Java 21, Spring Boot 3.5.x, Gradle
- 인프라 로컬 의존성: PostgreSQL, Redis
- 패키지 관리: pnpm workspace
- CI: GitHub Actions

## 모노레포 구조

```text
localbiz-radar/
  apps/
    web/          # Next.js 프론트엔드
    api/          # Spring Boot 백엔드
  docs/           # 프로젝트 및 개발 문서
  infra/          # 추후 인프라 설정
  .github/
    workflows/    # CI 워크플로
  docker-compose.yml
  package.json
  pnpm-workspace.yaml
```

## 로컬 개발

```bash
pnpm install
docker compose up -d
pnpm dev:api
pnpm dev:web
```

프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다. 백엔드는 `http://localhost:8080`에서 실행되며 PostgreSQL이 필요합니다. `docker-compose.yml`의 기본 PostgreSQL 설정은 애플리케이션 기본 환경 변수와 맞춰져 있습니다.

헬스 체크와 Swagger UI는 다음 경로에서 확인합니다.

- `GET http://localhost:8080/api/health`
- `http://localhost:8080/swagger-ui/index.html`

Swagger UI에서 `GET /api/stores/map`, `GET /api/stores/nearby`를 통해 지도 marker 조회와 반경 검색 API를 확인할 수 있습니다.
`POST /api/admin/sync/stores/csv`, `GET /api/admin/sync/logs`를 통해 CSV 기반 데이터 동기화 API도 확인할 수 있습니다.
`POST /api/admin/sync/stores/openapi`, `POST /api/admin/sync/stores/openapi/dry-run`, `GET /api/admin/sync/openapi/status`를 통해 소상공인 상가정보 OpenAPI 동기화 API를 확인할 수 있습니다.
`POST /api/admin/sync/master/regions/openapi`, `POST /api/admin/sync/master/categories/openapi`, `GET /api/master/regions`, `GET /api/master/categories`를 통해 행정구역/업종 코드 마스터 동기화와 조회 API를 확인할 수 있습니다.
`POST /api/analysis/compare`, `GET /api/analysis/region-ranking`를 통해 후보 지역 A/B 비교와 지역별 추천 랭킹 API를 확인할 수 있습니다.
`POST /api/auth/login`, `POST /api/auth/refresh`, `GET /api/auth/me`, `POST /api/auth/logout`를 통해 관리자 HttpOnly Cookie 인증 API를 확인할 수 있습니다.

주요 화면:

- `http://localhost:3000/stores`: Store API 기반 점포 목록
- `http://localhost:3000/dashboard`: Analysis API 기반 대시보드
- `http://localhost:3000/analysis`: Analysis API 기반 상권 분석
- `http://localhost:3000/compare`: 후보 지역 A/B 비교와 추천 지역 랭킹
- `http://localhost:3000/map`: Kakao Maps 기반 점포 분포와 반경 검색
- `http://localhost:3000/admin/login`: 관리자 로그인
- `http://localhost:3000/data-sync`: 개발용 소상공인 상가정보 CSV/OpenAPI 동기화

## 프론트엔드 품질 도구

Storybook은 공통 UI와 주요 화면 구성 요소를 Spring Boot API 없이 확인하기 위해 사용합니다.

```bash
pnpm storybook:web
pnpm build-storybook:web
```

Playwright E2E 테스트는 public page smoke test, 관리자 로그인/보호 흐름, 점포 목록, 후보 지역 비교, 접근성 smoke test를 검증합니다. 첫 실행 전 Chromium 브라우저가 없다면 다음 명령을 한 번 실행합니다.

```bash
pnpm --filter web exec playwright install chromium
pnpm e2e:web
```

E2E 테스트는 Spring Boot API 응답을 브라우저 레벨에서 mock 처리하며, 공공데이터 OpenAPI나 Kakao 외부 API 동기화를 실행하지 않습니다. 실제 백엔드와 함께 수동으로 점검할 때는 `docker compose up -d`, `pnpm dev:api`, `pnpm dev:web`을 함께 실행합니다.

## 환경 변수 정책

- 공공데이터 service key는 이번 프로젝트에서 사용자 요청에 따라 backend `application.yml`에 직접 작성합니다.
- `.env`, `.env.local`, 운영 환경 변수는 각 실행 환경에서 별도로 관리합니다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출될 수 있으므로 공개 가능한 값에만 사용합니다.
- 예시 이름: `STORE_OPENAPI_BASE_URL`, `STORE_OPENAPI_ENABLED`, `STORE_OPENAPI_SCHEDULER_ENABLED`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`, `LOCALBIZ_STORE_SYNC_MAX_ROWS_PER_IMPORT`
- 예시 값은 `.env.example`에만 둡니다.

프론트엔드 로컬 지도 기능은 `apps/web/.env.local`에 다음 값을 설정하면 사용할 수 있습니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key
```

`NEXT_PUBLIC_KAKAO_MAP_APP_KEY`는 Kakao Maps JavaScript SDK를 브라우저에서 로드하기 위한 클라이언트 키입니다. Kakao Developers에서 JavaScript SDK 도메인 제한을 설정해야 하며, 실제 값은 커밋하지 않습니다.

소상공인 상가정보 OpenAPI service key는 `apps/api/src/main/resources/application.yml`의 `localbiz.store-openapi.service-key`에 직접 작성합니다. 프론트엔드에는 전달하지 않습니다.

```bash
STORE_OPENAPI_BASE_URL=https://apis.data.go.kr/B553077/api/open/sdsc2
STORE_OPENAPI_ENABLED=false
STORE_OPENAPI_SCHEDULER_ENABLED=false
STORE_OPENAPI_DEFAULT_SIDO_NAME=서울특별시
STORE_OPENAPI_DEFAULT_SIGUNGU_NAME=강남구
STORE_OPENAPI_DEFAULT_PAGE_SIZE=100
STORE_OPENAPI_MAX_PAGES_PER_RUN=1
STORE_OPENAPI_REQUEST_INTERVAL_MILLIS=1000
```

로컬에서 OpenAPI를 실제 호출하려면 공공데이터포털에서 소상공인시장진흥공단_상가(상권)정보 활용 신청을 완료한 뒤 `application.yml`의 `service-key`와 `STORE_OPENAPI_ENABLED=true` 설정을 확인합니다. 기본 endpoint는 `https://apis.data.go.kr/B553077/api/open/sdsc2`이며, backend client가 operation path와 `type=xml`을 붙여 호출합니다. 명세가 달라지면 `STORE_OPENAPI_BASE_URL`로 재정의합니다. 예약 동기화는 기본 비활성화입니다.
`STORE_OPENAPI_REQUEST_INTERVAL_MILLIS`는 공공데이터포털 호출 제한을 피하기 위한 요청 간격입니다. 기본값은 1000ms이며, 429 응답이 발생하면 잠시 대기한 뒤 더 작은 범위로 다시 실행합니다.

## 공공 API 키 보안 정책

공공 API 서비스 키는 프론트엔드에서 직접 사용하지 않습니다. 소상공인 상가정보 OpenAPI 호출은 Spring Boot 백엔드의 client/service 계층에서만 수행합니다. 프론트엔드는 백엔드가 가공한 내부 API만 호출하며, 서비스 키 값은 API 응답, 로그, 에러 메시지에 출력하지 않습니다.

Kakao Maps JavaScript Key는 공공 데이터 API service key와 다릅니다. 지도 SDK 로딩을 위해 브라우저에 노출될 수 있는 client key이며, 도메인 제한으로 보호합니다. 반대로 공공 데이터 service key는 절대 `NEXT_PUBLIC_*` 환경 변수에 넣지 않습니다.

## 관리자 인증

관리자 인증은 Spring Security와 HttpOnly Cookie 기반 JWT로 동작합니다. `/api/admin/**` API는 `ADMIN` 권한이 있는 accessToken cookie가 있어야 접근할 수 있고, Store/Region/Analysis/Map/Compare 같은 공개 조회 API는 로그인 없이 유지됩니다.

관리자 계정과 token/cookie 설정은 `apps/api/src/main/resources/application.yml`의 `localbiz.security`에서 관리합니다.

```yaml
localbiz:
  security:
    admin:
      username: admin
      password: admin1234
      display-name: LocalBiz Admin
    jwt:
      issuer: localbiz-radar
      access-token-valid-minutes: 15
      refresh-token-valid-days: 7
    cookie:
      access-token-name: LOCALBIZ_ACCESS_TOKEN
      refresh-token-name: LOCALBIZ_REFRESH_TOKEN
      http-only: true
      secure: false
      same-site: Lax
```

로그인 성공 시 token 값은 response body에 포함하지 않고, Spring Boot가 `Set-Cookie`로 `LOCALBIZ_ACCESS_TOKEN`, `LOCALBIZ_REFRESH_TOKEN`을 내려줍니다. 프론트엔드는 token 값을 읽거나 localStorage/sessionStorage에 저장하지 않으며 모든 API 요청에 `credentials: "include"`를 사용합니다.

refreshToken 원문은 DB에 저장하지 않고 SHA-256 hash로 `admin_refresh_tokens` table에 저장합니다. `/api/auth/refresh`가 성공하면 기존 refreshToken은 revoke되고 새 refreshToken으로 rotation됩니다. 로그아웃 시 refreshToken을 revoke하고 access/refresh cookie를 삭제합니다.

로컬 curl 테스트:

```bash
curl -i -c /tmp/localbiz-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}' \
  http://localhost:8080/api/auth/login

curl -i -b /tmp/localbiz-cookies.txt \
  http://localhost:8080/api/admin/sync/logs

curl -i -b /tmp/localbiz-cookies.txt -c /tmp/localbiz-cookies.txt \
  -X POST http://localhost:8080/api/auth/refresh

curl -i -b /tmp/localbiz-cookies.txt -c /tmp/localbiz-cookies.txt \
  -X POST http://localhost:8080/api/auth/logout
```

Cookie 기반 인증은 CSRF를 고려해야 하므로 현재는 SameSite=Lax와 JSON API 구조를 사용하고, 운영 단계에서는 CSRF token 도입과 `secure=true` 설정을 검토합니다.

## CSV 데이터 동기화

소상공인 상가정보 CSV를 `/data-sync` 화면에서 업로드하면 Spring Boot API가 header 기반으로 파싱하고, `external_store_id + source_system` 기준으로 `stores` table에 upsert합니다.

샘플 파일:

- `docs/samples/store-import-sample.csv`

권장 흐름:

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

1. `http://localhost:3000/data-sync`에 접속합니다.
2. 샘플 CSV 또는 같은 header 구조의 CSV를 선택합니다.
3. 먼저 `검증만 실행` 상태로 dry-run을 수행합니다.
4. 실패 row가 없거나 허용 가능한 수준이면 체크를 해제하고 실제 반영을 실행합니다.
5. `/stores`, `/dashboard`, `/analysis`, `/map`에서 반영 결과를 확인합니다.

dry-run은 parsing과 row validation만 수행하며 DB에 저장하지 않습니다. 실제 반영은 `stores` upsert와 `sync_logs` 기록을 함께 수행합니다. 공공 데이터 API key는 여전히 백엔드 전용 원칙을 유지하며, 프론트엔드는 Spring Boot API만 호출합니다.

## OpenAPI 데이터 동기화

`/data-sync` 화면의 OpenAPI 동기화 카드는 공공데이터포털 service key 설정 상태를 확인하고, 제한된 page/region 범위로 수동 동기화를 실행합니다. 먼저 dry-run으로 OpenAPI 호출과 응답 parsing을 검증한 뒤, 실제 반영을 실행하면 `stores` table에 insert/update되고 `sync_logs`에 `STORE_OPENAPI_SYNC` 이력이 남습니다.

`/data-sync` 화면과 `/api/admin/sync/**` API는 관리자 로그인 이후에만 사용할 수 있습니다. 로그인하지 않은 사용자가 `/data-sync`에 접근하면 `/admin/login?next=/data-sync`로 이동합니다.

현재 OpenAPI 동기화는 개발용 제한 수집입니다.

- 기본 대상: `서울특별시`, `강남구`
- 기본 operation: `storeListInDong`
- 기본 요청: `divId=signguCd`, `key=11680`, `numOfRows=100`, `pageNo=1`, `type=xml`
- 기본 page size: 100
- 기본 max pages per run: 1
- scheduler 기본값: disabled

예약 동기화는 `STORE_OPENAPI_SCHEDULER_ENABLED=true` 또는 `/data-sync`의 개발용 토글로 활성화할 수 있습니다. 기본 cron은 매일 03:00이며, 과도한 호출을 막기 위해 `STORE_OPENAPI_MAX_PAGES_PER_RUN` 제한을 항상 적용합니다.

## 코드 마스터 동기화

`/data-sync` 화면의 마스터 데이터 동기화 섹션은 소상공인 상가정보 OpenAPI 활용가이드 기준 코드 체계를 backend에서 동기화합니다. 행정구역은 `baroApi`, 업종 코드는 `largeUpjongList`, `middleUpjongList`, `smallUpjongList`를 사용합니다.

- 행정구역 기본 대상: 서울특별시(`ctprvnCd=11`)
- 행정구역 기본 범위: 시도, 시군구, 행정동
- 법정동: 기본 제외, 요청 시에만 포함
- 업종 기본 범위: 대분류, 중분류, 소분류 제한 호출
- 업종 중/소분류는 가능한 경우 optional 파라미터를 활용해 반복 호출을 줄이고 내부에서 제한/필터링
- service key: `application.yml`의 `localbiz.store-openapi.service-key`에서만 읽음

마스터 데이터가 반영되면 `/stores`, `/map`, `/analysis`, `/data-sync`의 지역/업종 필터는 코드 값을 선택값으로 사용하고, 기존 Store/Analysis/Map API 호출 시 필요한 명칭으로 변환합니다. 기존 `GET /api/regions`, `GET /api/stores/categories`는 마스터 데이터가 있으면 마스터 조회 결과를 재사용하고, 없으면 기존 seed/store 기반 결과로 fallback합니다.

## 후보 지역 비교

`/compare` 화면은 행정구역/업종 마스터 데이터를 기반으로 기준 지역과 비교 지역을 선택하고, Spring Boot Analysis API로 A/B 비교 결과를 조회합니다. 비교 조건은 URL query parameter에 반영되어 새로고침이나 링크 공유 후에도 유지되며, 최근 비교 조건은 브라우저 localStorage에 최대 5개까지 저장됩니다.

사용 API:

- `POST /api/analysis/compare`: 기준 지역과 비교 지역의 점포 수, 업종 비중, 경쟁 강도, 업종 다양성, 점포 밀도, LocalBiz 점수를 비교합니다.
- `GET /api/analysis/region-ranking`: 선택 업종 기준 지역별 LocalBiz 점수 랭킹을 조회합니다.

현재 비교 점수는 `stores` table의 점포 데이터 기반 개발용 지표입니다. 실제 유동인구, 추정매출, 임대료, 상권 경계 데이터는 아직 반영하지 않습니다.

## 현재 단계

- Store/Region 기본 schema와 Flyway seed data 추가
- Store/Region 조회 API와 Swagger UI 추가
- `/stores` 화면을 Spring Boot API 기반으로 전환
- Analysis API 추가
- `/dashboard`, `/analysis` 화면을 Analysis API 기반으로 전환
- 경쟁 지수, 업종 다양성, LocalBiz 점수 계산 방식 문서화
- 지도 marker 조회 API와 반경 검색 API 추가
- `/map` 화면을 Kakao Maps 기반 점포 분포 화면으로 추가
- 소상공인 상가정보 CSV import API와 sync log API 추가
- `/data-sync` 개발용 데이터 동기화 화면 추가
- 소상공인 상가정보 OpenAPI client, 수동 dry-run/동기화 API, 예약 동기화 구조 추가
- `/data-sync` 화면에 OpenAPI 설정 상태와 수동/예약 동기화 UI 추가
- 행정구역/업종 코드 마스터 테이블과 OpenAPI 동기화 API 추가
- `/stores`, `/map`, `/analysis`, `/data-sync` 필터를 코드 마스터 기반 선택 흐름으로 개선
- `/compare` 후보 지역 A/B 비교 화면과 지역 랭킹 API 추가
- Spring Security 기반 관리자 인증과 HttpOnly Cookie access/refresh token 추가
- `/data-sync`, `/api/admin/**` 보호와 refresh token rotation/revoke 추가
- Storybook 기반 UI 문서화와 Playwright E2E 테스트 기반 추가
- 공통 loading/error/empty 상태 UI와 접근성 점검 기준 정리
- 공공 API 설정 가이드 페이지 작성
- Spring Boot 헬스 체크 API 추가
- Vitest 및 Spring MVC slice test 추가

현재 분석 지표는 `stores` seed data의 점포 수와 업종 분포만으로 계산한 개발용 임시 지표입니다. 실제 유동인구, 추정매출, 상권 영역 데이터 기반 분석은 이후 공공 데이터 연동 단계에서 추가합니다.

## 검증

```bash
pnpm lint:web
pnpm build:web
pnpm test:web
pnpm build-storybook:web
pnpm e2e:web
pnpm run ci
```

`pnpm run ci`는 web lint/build/test/storybook build와 api test를 실행합니다. Playwright E2E는 로컬 검증 중심으로 분리되어 있으며, CI에 완전 자동화하려면 backend/db 준비와 seed data 전략을 함께 고정해야 합니다.

## 다음 단계

- 대용량 page 처리, retry/backoff, API quota 대응 정책 정리
- CSV/OpenAPI 실패 row 다운로드와 대용량 import 최적화
- 증분 동기화 기준과 저장소, 캐시, 배치 정책 수립
- 지도 marker clustering, 행정동 경계 polygon, PostGIS 기반 공간 검색 검토
- 시각 회귀 테스트, Storybook interaction test, CI 기반 E2E 자동화 검토
