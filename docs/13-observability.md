# 운영 관측성 및 관리자 운영 대시보드

## 기능 개요

이번 단계에서는 LocalBiz Radar 운영 상태를 확인하기 위한 기본 관측성 구성을 추가했다. Spring Boot API는 Actuator와 Micrometer로 metrics를 노출하고, 로컬 환경에서는 Prometheus, Grafana, Loki, Promtail을 별도 Docker Compose로 실행한다.

프론트엔드에는 관리자 전용 `/admin/ops` 화면을 추가했다. 이 화면은 Spring Boot의 `/api/admin/ops/**` API만 호출하며, 기존 HttpOnly Cookie 기반 관리자 인증을 그대로 사용한다.

## Spring Boot Actuator 설정

노출 endpoint:

- `/actuator/health`
- `/actuator/info`
- `/actuator/metrics`
- `/actuator/prometheus`

민감 정보가 포함될 수 있는 `env`, `beans`, `heapdump` 같은 endpoint는 노출하지 않는다.

기본 설정:

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics,prometheus
  endpoint:
    health:
      show-details: when_authorized
      probes:
        enabled: true
  metrics:
    tags:
      application: localbiz-radar-api
```

## Prometheus Metrics

Prometheus endpoint:

```bash
curl http://localhost:8080/actuator/prometheus
```

대표 지표:

- `http_server_requests_seconds_count`
- `http_server_requests_seconds_sum`
- `jvm_memory_used_bytes`
- `process_cpu_usage`
- `system_cpu_usage`
- `hikaricp_connections_active`
- `hikaricp_connections_idle`

모든 metrics에는 `application=localbiz-radar-api` tag를 붙인다.

## Trace ID 정책

`TraceIdFilter`가 모든 요청에 대해 traceId를 처리한다.

- 요청 header `X-Request-Id`가 있으면 그 값을 사용한다.
- 없으면 UUID를 생성한다.
- 응답 header `X-Request-Id`에 traceId를 내려준다.
- MDC key `traceId`로 로그에 포함한다.
- 요청 종료 후 MDC를 정리한다.

공공데이터 serviceKey, JWT token, cookie 값, request body 전체는 로그에 남기지 않는다.

## Structured Logging

기본 local profile에서는 사람이 읽기 쉬운 console pattern을 사용하고 traceId를 포함한다.

JSON 로그는 `json-logs` profile로 활성화한다.

```bash
SPRING_PROFILES_ACTIVE=json-logs pnpm dev:api
```

JSON 로그는 Docker/Loki 수집에 적합하며 `service`, `timestamp`, `level`, `logger`, `message`, `traceId` 같은 필드를 포함한다.

## Docker Compose 실행 방법

기본 DB/Redis:

```bash
docker compose up -d
```

관측성 스택:

```bash
docker compose -f docker-compose.observability.yml up -d
```

API와 Web:

```bash
pnpm dev:api
pnpm dev:web
```

확인 URL:

- API health: `http://localhost:8080/actuator/health`
- API metrics: `http://localhost:8080/actuator/prometheus`
- Prometheus: `http://localhost:9090`
- Grafana: `http://localhost:3001`
- 관리자 운영 대시보드: `http://localhost:3000/admin/ops`

Grafana 기본 계정은 local 개발용으로 `admin` / `admin`이다.

## Prometheus 구성

설정 파일:

- `infra/monitoring/prometheus/prometheus.yml`

기본 scrape target:

```yaml
static_configs:
  - targets:
      - host.docker.internal:8080
```

macOS와 Windows Docker Desktop에서는 `host.docker.internal`로 호스트에서 실행 중인 Spring Boot API에 접근할 수 있다. Linux 환경에서는 Docker 버전과 설정에 따라 동작하지 않을 수 있으므로 `extra_hosts` 또는 host network, 직접 IP 지정 중 하나를 선택한다.

## Grafana 구성

Provisioning 파일:

- `infra/monitoring/grafana/provisioning/datasources/datasources.yml`
- `infra/monitoring/grafana/provisioning/dashboards/dashboards.yml`
- `infra/monitoring/grafana/dashboards/localbiz-radar-api-overview.json`

기본 datasource:

- Prometheus
- Loki

기본 dashboard:

- LocalBiz Radar API Overview

초기 패널:

- HTTP request rate
- HTTP response status count
- JVM memory usage
- JVM CPU usage
- datasource connection pool
- application logs

## Loki/Promtail 구성

설정 파일:

- `infra/monitoring/loki/loki-config.yml`
- `infra/monitoring/promtail/promtail-config.yml`

Promtail은 Docker socket과 container log path를 읽어 Loki로 전달한다. Grafana Explore에서 Loki datasource를 선택한 뒤 다음과 같은 label로 조회한다.

```logql
{service=~".*api.*|localbiz-radar-api"}
```

Docker log path는 OS와 Docker 설치 방식에 따라 다를 수 있다. Docker Desktop 환경에서는 promtail container가 `/var/lib/docker/containers`에 접근하지 못할 수 있으므로, 이 경우 Spring Boot를 `json-logs` profile로 실행하고 별도 파일 로그 수집 방식으로 전환하는 구성이 필요하다.

## 관리자 운영 대시보드 API

모든 API는 `/api/admin/**` 하위에 있으므로 관리자 인증이 필요하다.

- `GET /api/admin/ops/overview`
  - 서비스 상태, profile, uptime, 점포 수, 마스터 수, 최근 동기화 상태
- `GET /api/admin/ops/sync-summary?days=7`
  - 최근 N일 동기화 실행 수, 성공/부분 성공/실패 수, 유형별 요약, 최근 실패
- `GET /api/admin/ops/data-quality`
  - 좌표/주소/업종 누락 수, 중복 외부 점포 ID 수, 보유율

인증 cookie가 없으면 401을 반환하고, 유효한 관리자 accessToken cookie가 있으면 200을 반환한다.

## /admin/ops 화면

화면 구성:

- 서비스 상태 카드
- 점포/마스터 데이터 요약 카드
- 최근 7일 동기화 상태 chart
- 최근 실패 이력
- 데이터 품질 chart
- Prometheus/Grafana/Loki 안내

프론트엔드는 token 값을 직접 읽지 않고 기존 api-client의 `credentials: "include"` 흐름을 사용한다.

## 테스트 방법

Backend:

```bash
cd apps/api
./gradlew test
```

Frontend:

```bash
pnpm lint:web
pnpm build:web
pnpm e2e:web
```

관측성 compose 설정 확인:

```bash
docker compose -f docker-compose.observability.yml config
```

수동 확인:

1. `docker compose up -d`
2. `docker compose -f docker-compose.observability.yml up -d`
3. `pnpm dev:api`
4. `pnpm dev:web`
5. `http://localhost:3000/admin/ops` 접속
6. 관리자 로그인 후 운영 대시보드 확인
7. `http://localhost:9090/targets`에서 `localbiz-radar-api` scrape 상태 확인
8. `http://localhost:3001`에서 Grafana dashboard 확인

## 현재 한계

- Promtail Docker log 수집은 OS와 Docker 설치 방식에 따라 추가 조정이 필요할 수 있다.
- OpenTelemetry distributed tracing은 아직 추가하지 않았다.
- alert rule과 notification channel은 아직 구성하지 않았다.
- `/admin/ops` 지표는 현재 DB count와 sync_logs 기반 요약이며, 장기 시계열 분석은 Grafana/Prometheus에서 확인한다.

## 향후 개선 계획

- OpenTelemetry tracing 추가
- distributed tracing과 traceId 기반 로그/metric 연계
- Prometheus alert rule 추가
- production profile 분리
- Nginx reverse proxy와 TLS 구성
- Grafana dashboard 고도화
- 관리자 감사 로그 추가
