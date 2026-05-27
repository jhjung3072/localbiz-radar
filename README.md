# LocalBiz Radar

LocalBiz Radar는 공공 데이터를 기반으로 지역 상권을 탐색하고 비교하는 로컬 커머스 분석 대시보드입니다. 현재 단계에서는 실제 공공 API를 호출하지 않고, 개발용 seed data를 Spring Boot API로 조회해 점포 목록, 대시보드, 상권 분석 흐름을 검증합니다.

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

주요 화면:

- `http://localhost:3000/stores`: Store API 기반 점포 목록
- `http://localhost:3000/dashboard`: Analysis API 기반 대시보드
- `http://localhost:3000/analysis`: Analysis API 기반 상권 분석
- `http://localhost:3000/map`: Kakao Maps 기반 점포 분포와 반경 검색

## 환경 변수 정책

- 실제 비밀값은 저장소에 커밋하지 않습니다.
- `.env`, `.env.local`, 운영 환경 변수는 각 실행 환경에서 별도로 관리합니다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출될 수 있으므로 공개 가능한 값에만 사용합니다.
- 예시 이름: `PUBLIC_DATA_SERVICE_KEY`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
- 예시 값은 `.env.example`에만 둡니다.

프론트엔드 로컬 지도 기능은 `apps/web/.env.local`에 다음 값을 설정하면 사용할 수 있습니다.

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key
```

`NEXT_PUBLIC_KAKAO_MAP_APP_KEY`는 Kakao Maps JavaScript SDK를 브라우저에서 로드하기 위한 클라이언트 키입니다. Kakao Developers에서 JavaScript SDK 도메인 제한을 설정해야 하며, 실제 값은 커밋하지 않습니다.

## 공공 API 키 보안 정책

공공 API 서비스 키는 프론트엔드에서 직접 사용하지 않습니다. 실제 공공 API 연동은 이후 단계에서 Spring Boot 백엔드의 클라이언트 또는 프록시 계층을 통해서만 추가합니다. 프론트엔드는 백엔드가 가공한 내부 API만 호출하며, 서비스 키는 백엔드 환경 변수로만 주입합니다.

Kakao Maps JavaScript Key는 공공 데이터 API service key와 다릅니다. 지도 SDK 로딩을 위해 브라우저에 노출될 수 있는 client key이며, 도메인 제한으로 보호합니다. 반대로 `PUBLIC_DATA_SERVICE_KEY` 같은 공공 데이터 service key는 절대 `NEXT_PUBLIC_*` 환경 변수에 넣지 않습니다.

## 현재 단계

- Store/Region 기본 schema와 Flyway seed data 추가
- Store/Region 조회 API와 Swagger UI 추가
- `/stores` 화면을 Spring Boot API 기반으로 전환
- Analysis API 추가
- `/dashboard`, `/analysis` 화면을 Analysis API 기반으로 전환
- 경쟁 지수, 업종 다양성, LocalBiz 점수 계산 방식 문서화
- 지도 marker 조회 API와 반경 검색 API 추가
- `/map` 화면을 Kakao Maps 기반 점포 분포 화면으로 추가
- 공공 API 설정 가이드 페이지 작성
- Spring Boot 헬스 체크 API 추가
- Vitest 및 Spring MVC slice test 추가

현재 분석 지표는 `stores` seed data의 점포 수와 업종 분포만으로 계산한 개발용 임시 지표입니다. 실제 유동인구, 추정매출, 상권 영역 데이터 기반 분석은 이후 공공 데이터 연동 단계에서 추가합니다.

## 검증

```bash
pnpm run ci
```

## 다음 단계

- 공공 상가업소 데이터 응답 구조 조사
- Spring Boot 백엔드 전용 공공 API 클라이언트 설계
- 저장소, 캐시, 배치 동기화 전략 수립
- 지도 marker clustering, 행정동 경계 polygon, PostGIS 기반 공간 검색 검토
- 인증은 요구사항이 확정된 이후 별도 단계에서 검토
