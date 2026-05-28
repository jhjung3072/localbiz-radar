# 프로덕션 배포 패키징 가이드

## 기능 개요

이번 단계에서는 실제 클라우드 배포 대신 로컬에서 production-like 실행을 검증할 수 있는 Docker/Nginx/CI 구성을 추가했다. Spring Boot API와 Next.js web을 각각 production image로 빌드하고, Nginx가 단일 origin에서 web과 API 요청을 reverse proxy한다.

새로운 비즈니스 API, Next.js BFF, Kubernetes, Terraform, 실제 클라우드 배포는 포함하지 않는다.

## Dockerfile 구조

### Spring Boot API

파일: `apps/api/Dockerfile`

- Java 21 multi-stage build를 사용한다.
- build stage에서 Gradle wrapper로 `bootJar`를 만든다.
- runtime stage는 Java 21 JRE image를 사용한다.
- `JAVA_OPTS` 환경변수로 JVM option을 주입할 수 있다.
- `app` non-root user로 실행한다.
- container port는 `8080`이다.
- health check는 `/actuator/health`를 기준으로 한다.

빌드:

```bash
docker build -f apps/api/Dockerfile -t localbiz-radar-api:local apps/api
```

### Next.js Web

파일: `apps/web/Dockerfile`

- pnpm workspace lockfile을 사용하므로 Docker build context는 repo root다.
- `next.config.ts`에 `output: "standalone"`을 설정한다.
- build stage에서 `pnpm --filter web build`를 실행한다.
- runtime stage에는 standalone server, `.next/static`, `public`만 복사한다.
- `nextjs` non-root user로 실행한다.
- container port는 `3000`이다.

빌드:

```bash
docker build -f apps/web/Dockerfile -t localbiz-radar-web:local \
  --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost \
  --build-arg NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key \
  --build-arg NEXT_PUBLIC_SENTRY_DSN= \
  --build-arg NEXT_PUBLIC_SENTRY_ENVIRONMENT=production-like \
  .
```

`SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`는 source map upload에만 사용한다. 값이 없으면 local/PR build에서 upload를 건너뛰며 build가 실패하지 않아야 한다.

## Next.js Standalone

`output: "standalone"`은 Next.js production server 실행에 필요한 파일만 `.next/standalone`에 모은다. 현재 monorepo 산출물은 `apps/web/.next/standalone/apps/web/server.js` 형태이며, Docker runtime은 다음 명령으로 실행한다.

```bash
node apps/web/server.js
```

`NEXT_PUBLIC_*` 값은 client bundle에 포함될 수 있으므로 공개 가능한 값만 사용한다. 공공데이터 service key는 frontend 환경변수로 전달하지 않는다.

## Nginx Routing

파일: `infra/nginx/nginx.conf`

| Path | 대상 service | 설명 |
| --- | --- | --- |
| `/` | `web:3000` | Next.js 화면 |
| `/_next/static/` | `web:3000` | 정적 asset, immutable cache header 적용 |
| `/api/` | `api:8080` | Spring Boot API |
| `/actuator/health` | `api:8080` | health check |
| `/actuator/prometheus` | `api:8080` | Prometheus metrics |

Nginx는 `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host`, `X-Forwarded-Port` header를 API로 전달한다. Spring Boot는 `server.forward-headers-strategy=framework`로 forwarded header를 처리한다.

HttpOnly Cookie 기반 관리자 인증은 Nginx 뒤에서도 동일하게 동작해야 한다. `/api/auth/login`, `/api/auth/refresh`, `/api/auth/logout`의 `Set-Cookie` header는 별도 가공 없이 브라우저로 전달한다.

## docker-compose.prod.yml

파일: `docker-compose.prod.yml`

서비스:

- `postgres`: production-like PostgreSQL
- `redis`: production-like Redis
- `api`: Spring Boot API image
- `web`: Next.js standalone image
- `nginx`: reverse proxy

실행:

```bash
cp .env.production.example .env.production
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build
```

중지:

```bash
docker compose -f docker-compose.prod.yml down
```

볼륨까지 삭제하려면 다음 명령을 사용한다. 로컬 데이터가 삭제되므로 필요할 때만 실행한다.

```bash
docker compose -f docker-compose.prod.yml down -v
```

확인 URL:

- Web: `http://localhost`
- API health: `http://localhost/api/health`
- Actuator health: `http://localhost/actuator/health`
- Prometheus metrics: `http://localhost/actuator/prometheus`
- Direct API/Web, 필요한 경우: `docker-compose.prod.direct.yml` override 사용

기본 production-like compose는 Nginx만 host port로 노출한다. API/Web container를 직접 열어야 하면 다음 override를 함께 사용한다.

```bash
docker compose -f docker-compose.prod.yml -f docker-compose.prod.direct.yml up -d
```

이 경우 기본 direct URL은 `http://localhost:8080`, `http://localhost:3000`이다. 이미 로컬 개발 서버가 `3000` 또는 `8080` port를 사용 중이면 `.env.production`에서 `WEB_PORT`, `API_PORT`를 변경한다. Nginx port `80`이 사용 중이면 `NGINX_PORT`를 변경한다.

## 환경변수

예시 파일: `.env.production.example`

주요 값:

- `POSTGRES_DB`, `POSTGRES_USER`, `POSTGRES_PASSWORD`
- `NEXT_PUBLIC_API_BASE_URL=http://localhost`
- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`
- `NEXT_PUBLIC_SENTRY_DSN`
- `NEXT_PUBLIC_SENTRY_ENVIRONMENT`
- `SENTRY_ORG`, `SENTRY_PROJECT`, `SENTRY_AUTH_TOKEN`
- `LOCALBIZ_CORS_ALLOWED_ORIGINS`
- `SERVER_FORWARD_HEADERS_STRATEGY=framework`
- `JAVA_OPTS`
- `NGINX_PORT`, `API_PORT`, `WEB_PORT`

공공데이터 service key는 프로젝트 원칙에 따라 Spring Boot `application.yml`의 `localbiz.store-openapi.service-key`에서 읽는다. 이번 작업에서 환경변수 방식으로 되돌리지 않는다.

## Health Check 전략

- Docker API health check: `http://127.0.0.1:8080/actuator/health`
- Docker web health check: `http://127.0.0.1:3000`
- Docker nginx health check: `http://127.0.0.1/actuator/health`
- Compose dependency는 `condition: service_healthy`를 사용한다.

Actuator는 `health`, `info`, `metrics`, `prometheus`만 노출한다. `env`, `heapdump`, `beans` 같은 민감 endpoint는 열지 않는다.

## GitHub Actions

파일: `.github/workflows/docker-build.yml`

실행 시점:

- `main` branch push
- `main` branch 대상 pull request

수행 작업:

- `docker compose -f docker-compose.yml config`
- `docker compose -f docker-compose.observability.yml config`
- `docker compose -f docker-compose.prod.yml config`
- API image build
- Web image build

이번 단계에서는 GHCR push를 하지 않는다. 공공데이터 OpenAPI 실제 호출도 CI에 포함하지 않는다.

## 로컬 검증 순서

```bash
pnpm run ci
docker compose -f docker-compose.prod.yml config
docker build -f apps/api/Dockerfile -t localbiz-radar-api:local apps/api
docker build -f apps/web/Dockerfile -t localbiz-radar-web:local --build-arg NEXT_PUBLIC_API_BASE_URL=http://localhost .
docker compose -f docker-compose.prod.yml up -d --no-build
curl -i http://localhost/api/health
curl -i http://localhost/actuator/health
curl -I http://localhost
```

관리자 인증 확인:

```bash
curl -i -c /tmp/localbiz-prod-cookies.txt \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin1234"}' \
  http://localhost/api/auth/login

curl -i -b /tmp/localbiz-prod-cookies.txt \
  http://localhost/api/admin/sync/logs
```

브라우저에서는 `http://localhost/admin/login`에서 로그인한 뒤 `/data-sync`, `/admin/ops` 접근을 확인한다.

## 문제 해결

### Nginx 502

- `docker compose -f docker-compose.prod.yml ps`로 `api`, `web` health 상태를 확인한다.
- `docker compose -f docker-compose.prod.yml logs api web nginx`로 container log를 확인한다.
- web image가 standalone server를 `apps/web/server.js`로 실행하는지 확인한다.

### Cookie 인증 실패

- API login 응답에 `Set-Cookie`가 있는지 확인한다.
- Nginx가 `/api/auth/**`를 API service로 proxy하는지 확인한다.
- local production-like 환경에서는 `secure=false`, `SameSite=Lax`를 사용한다.
- HTTPS 운영 환경에서는 `secure=true`로 전환한다.

### API health check 실패

- PostgreSQL과 Redis health가 먼저 정상인지 확인한다.
- `SPRING_DATASOURCE_URL`, `SPRING_DATA_REDIS_HOST`가 compose service name을 가리키는지 확인한다.
- Flyway migration 실패가 없는지 API log를 확인한다.

### Sentry build token 없음

- `SENTRY_AUTH_TOKEN`이 없어도 local/PR build는 source map upload를 건너뛰어야 한다.
- source map upload가 필요하면 CI secret으로 `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, `SENTRY_PROJECT`를 설정한다.

### Kakao Maps key 없음

- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`가 없으면 지도 화면은 key 설정 안내 상태를 보여준다.
- production-like build에서는 build arg로 Kakao JavaScript key를 전달한다.

## 현재 한계

- 실제 클라우드 배포, HTTPS termination, domain 설정은 포함하지 않는다.
- GHCR image push는 아직 수행하지 않는다.
- production DB backup/restore 정책은 아직 없다.
- Nginx TLS, WAF, rate limit은 아직 구성하지 않는다.
- E2E를 CI production compose 위에서 완전 자동화하지 않는다.

## 향후 개선 계획

- 실제 클라우드 배포
- GHCR image push
- Nginx HTTPS 설정
- Terraform 기반 인프라 관리
- Blue/Green 배포
- DB backup과 restore runbook
- production observability profile 분리
