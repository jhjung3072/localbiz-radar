# 관리자 인증/인가

## 기능 개요

관리자 인증은 데이터 동기화 기능을 보호하기 위한 Spring Security 기반 인증/인가 기능입니다. 현재 단계에서는 DB 기반 사용자 관리나 회원가입 없이 `application.yml`에 정의한 단일 관리자 계정을 사용합니다.

프론트엔드는 Spring Boot API만 호출하며, token 값을 직접 읽거나 저장하지 않습니다. accessToken과 refreshToken은 모두 Spring Boot가 `Set-Cookie`로 내려주는 HttpOnly Cookie에 저장됩니다.

## 인증 흐름

1. 사용자가 `/admin/login`에서 관리자 계정으로 로그인합니다.
2. `POST /api/auth/login`이 계정을 검증합니다.
3. Spring Boot가 accessToken과 refreshToken을 생성합니다.
4. refreshToken 원문은 저장하지 않고 SHA-256 hash만 `admin_refresh_tokens` table에 저장합니다.
5. 응답 body에는 token 값을 넣지 않고 `Set-Cookie`로 두 token cookie를 내려줍니다.
6. 프론트엔드는 이후 API 요청에 `credentials: "include"`를 사용합니다.
7. `/api/admin/**` 요청은 accessToken cookie로 인증됩니다.
8. accessToken이 만료되어 401이 발생하면 프론트엔드는 `/api/auth/refresh`를 한 번 호출합니다.
9. refresh가 성공하면 원래 요청을 한 번 재시도합니다.
10. refresh가 실패하면 `/admin/login?next=/data-sync`로 이동합니다.

## Backend Security 구조

주요 구성:

- `SecurityConfig`: 공개 API와 관리자 API 인가 규칙, CORS, stateless session 설정
- `CookieJwtAuthenticationFilter`: request cookie에서 accessToken을 읽어 `SecurityContext` 구성
- `JwtTokenService`: accessToken/refreshToken 생성과 검증
- `AuthService`: 로그인 검증, refreshToken rotation, logout revoke 처리
- `AuthCookieService`: token cookie 생성, 삭제, request cookie 추출
- `AdminRefreshTokenRepository`: refreshToken hash 저장/조회/revoke

`/api/admin/**`는 `ROLE_ADMIN` 권한이 필요합니다. 공개 조회 API는 기존처럼 로그인 없이 접근할 수 있습니다.

## Frontend Auth 구조

주요 구성:

- `apps/web/src/features/auth/api/auth-api.ts`
- `apps/web/src/features/auth/store/auth-store.ts`
- `apps/web/src/features/auth/components/login-form.tsx`
- `apps/web/src/features/auth/components/admin-guard.tsx`
- `apps/web/src/features/auth/components/auth-status-button.tsx`
- `apps/web/src/lib/api-client.ts`

프론트엔드 auth store에는 `user`, `isAuthenticated`, `isChecking` 같은 UI 상태만 저장합니다. token 원문은 localStorage, sessionStorage, Zustand persist, memory state에 저장하지 않습니다.

## Access Token과 Refresh Token

accessToken:

- 짧은 만료 시간
- `/api/admin/**` 인증에 사용
- cookie name: `LOCALBIZ_ACCESS_TOKEN`
- JavaScript에서 읽을 수 없는 HttpOnly Cookie

refreshToken:

- accessToken 재발급에 사용
- cookie name: `LOCALBIZ_REFRESH_TOKEN`
- 원문은 DB에 저장하지 않음
- `admin_refresh_tokens.token_hash`에 SHA-256 hash 저장
- refresh 성공 시 기존 token revoke 후 새 token 발급

JWT claim:

- `sub`: username
- `role`: `ADMIN`
- `iss`: `localbiz-radar`
- `jti`: token id
- `iat`
- `exp`
- `tokenType`: `ACCESS` 또는 `REFRESH`

## HttpOnly Cookie 정책

기본 local 설정:

```yaml
localbiz:
  security:
    cookie:
      access-token-name: LOCALBIZ_ACCESS_TOKEN
      refresh-token-name: LOCALBIZ_REFRESH_TOKEN
      http-only: true
      secure: false
      same-site: Lax
      path: /
      access-token-max-age-seconds: 900
      refresh-token-max-age-seconds: 604800
```

HttpOnly Cookie는 JavaScript에서 읽을 수 없기 때문에 XSS로 token을 직접 탈취하는 위험을 줄일 수 있습니다. Cookie 기반 인증은 CSRF를 고려해야 하므로 현재는 SameSite=Lax를 사용하고, 운영 단계에서는 CSRF token 도입을 검토합니다.

local 개발에서는 `secure=false`를 사용합니다. HTTPS 운영 환경에서는 `secure=true`로 변경해야 합니다.

## Refresh Token Rotation/Revoke

`POST /api/auth/refresh` 동작:

1. refreshToken cookie를 읽습니다.
2. JWT signature, issuer, tokenType, 만료 시간을 검증합니다.
3. `jti`로 DB refreshToken row를 조회합니다.
4. token hash, revoke 여부, 만료 여부를 검증합니다.
5. 기존 row의 `revoked_at`을 채우고 `replaced_by_token_id`에 새 token id를 저장합니다.
6. 새 refreshToken row를 저장합니다.
7. 새 accessToken/refreshToken cookie를 내려줍니다.

이미 revoke된 refreshToken, 만료된 refreshToken, DB hash와 맞지 않는 refreshToken은 401로 처리합니다.

## Auth API

- `POST /api/auth/login`: 관리자 로그인, token cookie 설정
- `POST /api/auth/refresh`: refreshToken cookie 기반 token rotation
- `GET /api/auth/me`: 현재 관리자 정보 조회
- `POST /api/auth/logout`: refreshToken revoke와 cookie 삭제

로그인/refresh 응답 body에는 token 값을 포함하지 않습니다.

## 보호되는 API

- `POST /api/admin/sync/stores/csv`
- `GET /api/admin/sync/logs`
- `GET /api/admin/sync/logs/{id}`
- `POST /api/admin/sync/stores/openapi`
- `POST /api/admin/sync/stores/openapi/dry-run`
- `GET /api/admin/sync/openapi/status`
- `PATCH /api/admin/sync/openapi/schedule`
- `POST /api/admin/sync/master/regions/openapi`
- `POST /api/admin/sync/master/categories/openapi`
- `GET /api/admin/sync/master/status`

cookie가 없거나 유효하지 않으면 401을 반환합니다.

## 공개 API

- `GET /api/health`
- `GET /actuator/health`
- `GET /actuator/info`
- `GET /api/stores/**`
- `GET /api/regions/**`
- `GET /api/master/**`
- `GET /api/analysis/**`
- `POST /api/analysis/compare`
- `GET /swagger-ui/**`
- `GET /v3/api-docs/**`

`/stores`, `/dashboard`, `/analysis`, `/compare`, `/map` 화면은 로그인 없이 계속 동작합니다.

## application.yml 설정

관리자 설정은 `apps/api/src/main/resources/application.yml`에서 관리합니다.

```yaml
localbiz:
  security:
    admin:
      username: admin
      password: admin1234
      display-name: LocalBiz Admin
    jwt:
      issuer: localbiz-radar
      access-token-secret: local-development-access-token-secret-change-me-change-me
      refresh-token-secret: local-development-refresh-token-secret-change-me-change-me
      access-token-valid-minutes: 15
      refresh-token-valid-days: 7
```

공공데이터 serviceKey 설정은 기존처럼 `localbiz.store-openapi.service-key`에서 읽습니다. 관리자 인증 작업은 공공데이터 OpenAPI 설정 방식을 변경하지 않습니다.

## CORS/Cookie 설정

local frontend는 `http://localhost:3000`, Spring Boot API는 `http://localhost:8080`을 사용합니다.

Backend CORS 설정:

- `allowedOrigins`: `http://localhost:3000`
- `allowCredentials`: `true`
- wildcard `"*"` 사용 안 함
- methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`, `OPTIONS`

Frontend fetch 설정:

- 모든 API 요청에 `credentials: "include"`
- Authorization Bearer header 사용 안 함
- token cookie 직접 접근 안 함

## 테스트 방법

로컬 실행:

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

브라우저:

1. `http://localhost:3000/data-sync`에 접속합니다.
2. 로그인 전이면 `/admin/login?next=/data-sync`로 이동하는지 확인합니다.
3. 관리자 계정으로 로그인합니다.
4. 로그인 성공 후 `/data-sync`로 이동하는지 확인합니다.
5. DevTools > Application > Cookies에서 `LOCALBIZ_ACCESS_TOKEN`, `LOCALBIZ_REFRESH_TOKEN`이 HttpOnly로 저장되는지 확인합니다.
6. CSV dry-run, OpenAPI status, sync log 조회가 정상 동작하는지 확인합니다.
7. 로그아웃 후 `/data-sync` 접근이 다시 로그인 페이지로 이동하는지 확인합니다.

curl:

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

검증 명령:

```bash
pnpm run ci
```

## 현재 한계와 향후 계획

- 현재는 단일 관리자 계정만 지원합니다.
- 회원가입과 DB 기반 사용자 테이블은 없습니다.
- role은 `ADMIN` 하나만 사용합니다.
- CSRF token은 아직 적용하지 않았고 SameSite=Lax로 기본 방어합니다.
- Next.js BFF 기반 admin proxy는 도입하지 않았습니다.
- 향후 DB 기반 사용자 관리, role 세분화, CSRF token, 운영 환경 secure cookie, 감사 로그, Next.js BFF 기반 admin proxy를 별도 단계에서 검토합니다.
