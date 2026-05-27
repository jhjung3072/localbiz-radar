# 개발 가이드

## 기본 요구사항

- Node.js 20 이상 권장
- pnpm 10.x
- Java 21
- Docker 및 Docker Compose

## 설치

```bash
pnpm install
```

## 프론트엔드 실행

```bash
pnpm dev:web
```

브라우저에서 `http://localhost:3000`으로 접속합니다.

## 백엔드 실행

현재 phase의 백엔드는 Store/Region 조회 API를 제공하므로 PostgreSQL이 필요합니다. 먼저 로컬 의존성을 실행합니다.

```bash
docker compose up -d
pnpm dev:api
```

헬스 체크:

```bash
curl http://localhost:8080/api/health
```

예상 응답:

```json
{
  "status": "ok",
  "service": "localbiz-radar-api"
}
```

Swagger UI:

- `http://localhost:8080/swagger-ui/index.html`

점포 목록 API:

- `GET http://localhost:8080/api/stores`
- `GET http://localhost:8080/api/stores/categories`
- `GET http://localhost:8080/api/regions`

분석 API:

- `GET http://localhost:8080/api/analysis/summary`
- `GET http://localhost:8080/api/analysis/category-distribution`
- `GET http://localhost:8080/api/analysis/competition`
- `POST http://localhost:8080/api/analysis/compare`

지도 API:

- `GET http://localhost:8080/api/stores/map`
- `GET http://localhost:8080/api/stores/nearby`

데이터 동기화 API:

- `POST http://localhost:8080/api/admin/sync/stores/csv`
- `POST http://localhost:8080/api/admin/sync/stores/openapi`
- `POST http://localhost:8080/api/admin/sync/stores/openapi/dry-run`
- `GET http://localhost:8080/api/admin/sync/openapi/status`
- `PATCH http://localhost:8080/api/admin/sync/openapi/schedule`
- `GET http://localhost:8080/api/admin/sync/logs`
- `GET http://localhost:8080/api/admin/sync/logs/{id}`

## Kakao Maps 설정

`/map` 화면은 Kakao Maps JavaScript SDK를 사용합니다. 이 키는 브라우저 SDK 로딩용 client key이며, 공공 데이터 API service key와 다릅니다.

1. Kakao Developers에서 애플리케이션을 만들고 JavaScript Key를 발급합니다.
2. 플랫폼 설정에서 Web 플랫폼을 추가합니다.
3. JavaScript SDK 도메인에 로컬 개발 주소를 등록합니다.

로컬 도메인 예시:

- `http://localhost:3000`
- `http://127.0.0.1:3000`

`apps/web/.env.local` 예시:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key
```

실제 Kakao Maps key 값은 `.env.local`에만 두고 Git에 커밋하지 않습니다. 공공 데이터 service key는 `NEXT_PUBLIC_*`에 넣지 않으며, 이번 프로젝트에서는 Spring Boot `application.yml`의 `localbiz.store-openapi.service-key`로만 관리합니다.

지도 화면 로컬 실행:

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

브라우저에서 `http://localhost:3000/map`으로 접속합니다.

## CSV 데이터 동기화 실행

샘플 파일:

- `docs/samples/store-import-sample.csv`

로컬 실행:

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

브라우저에서 `http://localhost:3000/data-sync`으로 접속합니다.

권장 순서:

1. 샘플 CSV를 선택합니다.
2. `검증만 실행` 상태로 dry-run을 먼저 실행합니다.
3. 결과의 실패 row를 확인합니다.
4. 실제 반영이 필요하면 체크를 해제하고 다시 업로드합니다.
5. `/stores`, `/dashboard`, `/analysis`, `/map`에서 데이터 반영을 확인합니다.

## OpenAPI 데이터 동기화 실행

소상공인시장진흥공단_상가(상권)정보 OpenAPI를 사용하려면 공공데이터포털에서 활용 신청을 먼저 완료합니다. API key는 백엔드 `application.yml`의 `localbiz.store-openapi.service-key`로만 설정하며, 프론트엔드의 `NEXT_PUBLIC_*` 값에 넣지 않습니다.

백엔드 설정 예시:

```bash
STORE_OPENAPI_BASE_URL=https://apis.data.go.kr/B553077/api/open/sdsc2
STORE_OPENAPI_ENABLED=true
STORE_OPENAPI_SCHEDULER_ENABLED=false
STORE_OPENAPI_DEFAULT_SIDO_NAME=서울특별시
STORE_OPENAPI_DEFAULT_SIGUNGU_NAME=강남구
STORE_OPENAPI_DEFAULT_PAGE_SIZE=100
STORE_OPENAPI_DEFAULT_DIV_ID=signguCd
STORE_OPENAPI_DEFAULT_REGION_KEY=11680
STORE_OPENAPI_MAX_PAGES_PER_RUN=1
```

로컬 실행:

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

브라우저에서 `http://localhost:3000/data-sync`으로 접속한 뒤 OpenAPI 설정 상태를 확인합니다. 먼저 dry-run을 실행해 호출과 parsing 결과를 확인하고, 실제 반영이 필요할 때만 `실제 반영 실행`을 사용합니다.

예약 동기화는 기본 비활성화입니다. 로컬 개발에서는 `/data-sync`의 예약 동기화 토글 또는 `STORE_OPENAPI_SCHEDULER_ENABLED=true`로 활성화할 수 있지만, API quota를 아끼기 위해 `STORE_OPENAPI_MAX_PAGES_PER_RUN`을 낮게 유지합니다.

## 테스트와 빌드

```bash
pnpm lint:web
pnpm build:web
pnpm test:web
pnpm test:api
```

전체 확인:

```bash
pnpm run ci
```

## 코드 작성 규칙

- 문서와 README는 한국어로 작성합니다.
- 코드, 파일명, 폴더명, 변수명, 함수명, 클래스명, API 엔드포인트는 영어로 작성합니다.
- 프론트엔드에는 실제 공공 API 키를 두지 않습니다.
- 목업 데이터는 관련 feature 폴더에 가깝게 둡니다.
- Store/Region 데이터와 Analysis 지표는 현재 Flyway seed data 기반이며 실제 공공 API 동기화 데이터가 아닙니다.

## 환경 변수

예시:

```bash
STORE_OPENAPI_BASE_URL=https://apis.data.go.kr/B553077/api/open/sdsc2
STORE_OPENAPI_ENABLED=false
STORE_OPENAPI_SCHEDULER_ENABLED=false
STORE_OPENAPI_CRON=0 0 3 * * *
STORE_OPENAPI_DEFAULT_PAGE_SIZE=100
STORE_OPENAPI_DEFAULT_DIV_ID=signguCd
STORE_OPENAPI_DEFAULT_REGION_KEY=11680
STORE_OPENAPI_MAX_PAGES_PER_RUN=1
STORE_OPENAPI_REQUEST_TIMEOUT_SECONDS=10
STORE_OPENAPI_DEFAULT_SIDO_NAME=서울특별시
STORE_OPENAPI_DEFAULT_SIGUNGU_NAME=강남구
STORE_OPENAPI_DEFAULT_SOURCE_SYSTEM=SMALL_BUSINESS_OPENAPI
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
LOCALBIZ_CORS_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key
LOCALBIZ_STORE_SYNC_MAX_ROWS_PER_IMPORT=5000
LOCALBIZ_STORE_SYNC_MAX_FILE_SIZE_BYTES=20971520
LOCALBIZ_STORE_SYNC_FAIL_FAST=false
LOCALBIZ_STORE_SYNC_DEFAULT_SOURCE_SYSTEM=SMALL_BUSINESS_CSV
LOCALBIZ_STORE_SYNC_MAX_ERROR_SUMMARY_COUNT=20
```

실제 비밀값은 Git에 커밋하지 않습니다. `NEXT_PUBLIC_` 값은 브라우저 번들에 포함될 수 있으므로 공개 가능한 설정에만 사용합니다.
