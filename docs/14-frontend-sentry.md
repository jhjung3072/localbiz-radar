# 프론트엔드 Sentry 설정

## 기능 개요

이번 단계에서는 LocalBiz Radar의 Next.js frontend에 Sentry를 추가해 브라우저 런타임 오류, React rendering 오류, Next.js server/edge runtime 오류, 주요 사용자 액션 breadcrumb를 수집할 수 있게 구성했다. Spring Boot backend에는 Sentry를 추가하지 않으며, backend 장애와 운영 지표는 기존 Actuator, Prometheus, Grafana, Loki 구성을 사용한다.

## 도입 목적

- 사용자 화면에서 발생하는 렌더링 오류와 네트워크 오류를 빠르게 파악한다.
- `/stores`, `/analysis`, `/compare`, `/map`, `/data-sync`, `/admin/ops`의 주요 액션을 breadcrumb로 남겨 오류 전후 흐름을 이해한다.
- source map upload 준비를 통해 운영 빌드에서 읽기 쉬운 stack trace를 확보할 수 있게 한다.
- 관리자 인증 cookie나 공공데이터 serviceKey가 외부 오류 수집 도구로 전송되지 않도록 민감 정보 제거 정책을 코드로 고정한다.

## 설치 dependency

frontend package에 다음 dependency를 추가했다.

```text
@sentry/nextjs
```

`@sentry/nextjs`는 Next.js App Router의 client, server, edge runtime 에러 수집과 source map upload 설정을 공식적으로 지원한다.

## 환경변수

`apps/web/.env.example`에 다음 placeholder를 둔다.

```bash
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SENTRY_ENVIRONMENT=local
SENTRY_AUTH_TOKEN=
SENTRY_ORG=
SENTRY_PROJECT=
```

- `NEXT_PUBLIC_SENTRY_DSN`: 브라우저 SDK 초기화에 사용하는 공개 DSN
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`: Sentry environment 이름
- `SENTRY_AUTH_TOKEN`: source map upload 전용 token
- `SENTRY_ORG`: Sentry organization slug
- `SENTRY_PROJECT`: Sentry project slug

`SENTRY_AUTH_TOKEN`은 절대 커밋하지 않는다. local에서는 `apps/web/.env.local`, CI에서는 GitHub Actions secrets로 관리한다.

## 파일 구성

```text
apps/web/src/instrumentation-client.ts
apps/web/src/instrumentation.ts
apps/web/src/sentry.server.config.ts
apps/web/src/sentry.edge.config.ts
apps/web/src/app/global-error.tsx
apps/web/src/app/sentry-test/page.tsx
apps/web/src/lib/sentry-scrubber.ts
apps/web/src/lib/sentry-utils.ts
apps/web/next.config.ts
```

`instrumentation-client.ts`는 브라우저 SDK를 초기화한다. `instrumentation.ts`는 Next.js runtime에 따라 server 또는 edge 설정을 import하고 `onRequestError`를 Sentry로 연결한다. `global-error.tsx`는 React rendering error를 `Sentry.captureException`으로 기록한다.

## Client 설정

client 설정은 DSN이 있을 때만 `Sentry.init`을 실행한다.

- `dsn`: `NEXT_PUBLIC_SENTRY_DSN`
- `environment`: `NEXT_PUBLIC_SENTRY_ENVIRONMENT` 또는 `NODE_ENV`
- `sendDefaultPii`: `false`
- `tracesSampleRate`: development `1.0`, production `0.1`
- `replaysSessionSampleRate`: production `0.05`
- `replaysOnErrorSampleRate`: production `1.0`
- integration: `replayIntegration`, `feedbackIntegration`

Session Replay는 기본 마스킹 정책을 유지한다. input, text, media masking을 해제하지 않는다.

## Server/Edge 설정

`sentry.server.config.ts`와 `sentry.edge.config.ts`도 DSN이 있을 때만 초기화한다.

- `sendDefaultPii`: `false`
- `tracesSampleRate`: production에서 낮게 유지
- `beforeSend`: 민감 정보 제거 scrubber 적용

## Source Map Upload

`next.config.ts`는 기존 Next 설정을 유지하면서 `withSentryConfig`로 감싼다. source map upload는 다음 값이 모두 있을 때만 활성화된다.

```text
SENTRY_AUTH_TOKEN
SENTRY_ORG
SENTRY_PROJECT
```

값이 없으면 local build와 PR build에서 upload를 건너뛰고 실패하지 않는다. 실제 운영에서는 main branch CI에서 secrets를 주입해 upload를 수행하는 흐름을 권장한다.

## 민감 정보 제거 정책

`src/lib/sentry-scrubber.ts`에서 Sentry event를 전송하기 전에 다음 값을 제거한다.

- `cookie`
- `set-cookie`
- `authorization`
- `token`
- `secret`
- `serviceKey`
- `service_key`
- `apiKey`
- `password`
- request body data
- request cookies

API client에서 HTTP 500 이상 또는 network error를 기록할 때도 URL은 path 중심으로 남기고 query string은 전송하지 않는다. 401/403은 인증 흐름에서 자주 발생할 수 있으므로 Sentry error로 과도하게 전송하지 않는다.

## Breadcrumb 정책

다음 사용자 액션은 민감값 없이 breadcrumb로 남긴다.

- `/stores` 검색 조건 변경
- `/analysis` 분석 조건 변경
- `/compare` 비교 실행
- `/map` 반경 검색 실행
- `/data-sync` CSV/OpenAPI/마스터 동기화 실행 버튼 클릭
- `/admin/ops` 진입

검색어 원문, 인증 token, cookie, 공공데이터 serviceKey는 breadcrumb에 넣지 않는다.

## 테스트 방법

1. `apps/web/.env.local`에 `NEXT_PUBLIC_SENTRY_DSN`을 설정한다.
2. `pnpm dev:web`을 실행한다.
3. `http://localhost:3000/sentry-test`에 직접 접속한다.
4. `수동 captureException 테스트` 버튼을 눌러 Sentry issue가 생성되는지 확인한다.
5. `breadcrumb 테스트` 버튼을 눌러 event의 breadcrumb가 함께 전송되는지 확인한다.
6. `/admin/login`으로 로그인한 뒤 `/admin/ops`에서 Sentry 상태 카드를 확인한다.

DSN이 없으면 테스트 페이지 UI와 local 동작만 확인할 수 있으며, 실제 Sentry 서버로 이벤트는 전송되지 않는다.

## 현재 한계

- backend Sentry는 도입하지 않았다.
- source map upload는 설정만 준비했고, 실제 운영 CI secrets 구성은 별도 단계에서 진행한다.
- traceId와 Sentry event의 직접적인 cross-link는 아직 없다.
- Session Replay는 낮은 sample rate로만 사용하며, 개인정보 마스킹 정책을 우선한다.

## 향후 개선 계획

- release version과 git sha 연동
- GitHub Actions source map upload job 고도화
- Sentry alert rule 설정
- Spring Boot backend Sentry 도입 검토
- backend traceId와 Sentry event tag 연계
- frontend performance budget과 Sentry performance 지표 연동
