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

현재 phase의 백엔드는 `GET /api/health`만 제공하므로 로컬 DB 없이 실행할 수 있습니다.

```bash
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

PostgreSQL과 Redis가 필요한 다음 phase 작업에서는 다음 명령으로 로컬 의존성을 실행합니다.

```bash
docker compose up -d
```

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
- 아직 Store, Region, Analysis 도메인 모델은 백엔드에 만들지 않습니다.

## 환경 변수

예시:

```bash
PUBLIC_DATA_SERVICE_KEY=
SPRING_DATASOURCE_URL=
SPRING_DATASOURCE_USERNAME=
SPRING_DATASOURCE_PASSWORD=
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
```

실제 비밀값은 Git에 커밋하지 않습니다. `NEXT_PUBLIC_` 값은 브라우저 번들에 포함될 수 있으므로 공개 가능한 설정에만 사용합니다.
