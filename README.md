# LocalBiz Radar

LocalBiz Radar는 공공 데이터를 기반으로 지역 상권을 탐색하고 비교하는 로컬 커머스 분석 대시보드입니다. 현재 단계에서는 실제 공공 API를 호출하지 않고, 프론트엔드 화면 구조와 백엔드 기본 헬스 체크, 문서화된 개발 흐름을 먼저 구축합니다.

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
pnpm dev:web
```

프론트엔드는 기본적으로 `http://localhost:3000`에서 실행됩니다. 백엔드는 다음 명령으로 실행합니다. 현재 phase의 백엔드는 헬스 체크만 제공하므로 로컬 DB 없이도 실행됩니다.

```bash
pnpm dev:api
```

헬스 체크는 `GET http://localhost:8080/api/health`에서 확인할 수 있습니다.

PostgreSQL과 Redis는 이후 데이터 저장 및 캐시 전략 검증이 필요할 때 다음 명령으로 실행합니다.

```bash
docker compose up -d
```

## 환경 변수 정책

- 실제 비밀값은 저장소에 커밋하지 않습니다.
- `.env`, `.env.local`, 운영 환경 변수는 각 실행 환경에서 별도로 관리합니다.
- `NEXT_PUBLIC_` 접두사가 붙은 값은 브라우저에 노출될 수 있으므로 공개 가능한 값에만 사용합니다.
- 예시 이름: `PUBLIC_DATA_SERVICE_KEY`, `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`, `NEXT_PUBLIC_API_BASE_URL`

## 공공 API 키 보안 정책

공공 API 서비스 키는 프론트엔드에서 직접 사용하지 않습니다. 실제 공공 API 연동은 이후 단계에서 Spring Boot 백엔드의 클라이언트 또는 프록시 계층을 통해서만 추가합니다. 프론트엔드는 백엔드가 가공한 내부 API만 호출하며, 서비스 키는 백엔드 환경 변수로만 주입합니다.

## 현재 단계

- Next.js 앱 셸과 초기 화면 구현
- 목업 대시보드, 상가 목록, 상권 분석 화면 구현
- 공공 API 설정 가이드 페이지 작성
- Spring Boot 헬스 체크 API 추가
- Vitest smoke test와 GitHub Actions CI 추가

## 검증

```bash
pnpm run ci
```

## 다음 단계

- 공공 상가업소 데이터 응답 구조 조사
- Spring Boot 백엔드 전용 공공 API 클라이언트 설계
- 저장소, 캐시, 배치 동기화 전략 수립
- 지도 SDK와 인증은 요구사항이 확정된 이후 별도 단계에서 검토
