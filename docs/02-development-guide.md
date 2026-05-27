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
PUBLIC_DATA_SERVICE_KEY=
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
LOCALBIZ_CORS_ALLOWED_ORIGINS=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

실제 비밀값은 Git에 커밋하지 않습니다. `NEXT_PUBLIC_` 값은 브라우저 번들에 포함될 수 있으므로 공개 가능한 설정에만 사용합니다.
