# LocalBiz Radar

LocalBiz Radar는 공공 데이터를 기반으로 지역 상권을 탐색하고 비교하는 로컬 커머스 분석 대시보드입니다. 현재 단계에서는 실제 공공 API를 호출하지 않고, 개발용 seed data를 Spring Boot API로 조회해 점포 목록 화면과 필터 흐름을 검증합니다.

## 기술 스택

- 프론트엔드: Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, Recharts, TanStack Table
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

## 환경 변수 정책

- 실제 비밀값은 저장소에 커밋하지 않습니다.
- `.env`, `.env.local`, 운영 환경 변수는 각 실행 환경에서 별도로 관리합니다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출될 수 있으므로 공개 가능한 값에만 사용합니다.
- 예시 이름: `PUBLIC_DATA_SERVICE_KEY`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `NEXT_PUBLIC_API_BASE_URL`
- 예시 값은 `.env.example`에만 둡니다.

## 공공 API 키 보안 정책

공공 API 서비스 키는 프론트엔드에서 직접 사용하지 않습니다. 실제 공공 API 연동은 이후 단계에서 Spring Boot 백엔드의 클라이언트 또는 프록시 계층을 통해서만 추가합니다. 프론트엔드는 백엔드가 가공한 내부 API만 호출하며, 서비스 키는 백엔드 환경 변수로만 주입합니다.

## 현재 단계

- Store/Region 기본 schema와 Flyway seed data 추가
- Store/Region 조회 API와 Swagger UI 추가
- `/stores` 화면을 Spring Boot API 기반으로 전환
- 공공 API 설정 가이드 페이지 작성
- Spring Boot 헬스 체크 API 추가
- Vitest 및 Spring MVC slice test 추가

## 검증

```bash
pnpm run ci
```

## 다음 단계

- 공공 상가업소 데이터 응답 구조 조사
- Spring Boot 백엔드 전용 공공 API 클라이언트 설계
- 저장소, 캐시, 배치 동기화 전략 수립
- 지도 SDK와 인증은 요구사항이 확정된 이후 별도 단계에서 검토
