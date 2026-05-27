# OpenAPI 데이터 동기화

## 개요

OpenAPI 데이터 동기화는 소상공인시장진흥공단_상가(상권)정보 OpenAPI를 Spring Boot backend에서 호출하고, 응답 row를 `stores` table에 upsert하는 개발용 동기화 기능입니다.

프론트엔드는 공공데이터 OpenAPI를 직접 호출하지 않습니다. `/data-sync` 화면은 Spring Boot 내부 API만 호출하며, 공공데이터 service key는 backend `application.yml`에서만 관리합니다.

## 활용 신청

1. 공공데이터포털에서 소상공인시장진흥공단_상가(상권)정보 OpenAPI 활용 신청을 완료합니다.
2. 포털에서 제공하는 service key와 endpoint 명세를 확인합니다.
3. `apps/api/src/main/resources/application.yml`의 `localbiz.store-openapi.service-key`에 key를 설정합니다.

service key는 frontend 코드, API 응답, 로그, 에러 메시지에는 기록하지 않습니다.

## 설정

```bash
STORE_OPENAPI_BASE_URL=https://apis.data.go.kr/B553077/api/open/sdsc2
STORE_OPENAPI_ENABLED=true
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
```

`localbiz.store-openapi.service-key`는 backend에서만 읽습니다. `NEXT_PUBLIC_*` 환경변수에 넣으면 브라우저 번들에 노출될 수 있으므로 금지합니다.

## 수동 동기화 API

### 상태 확인

```http
GET /api/admin/sync/openapi/status
```

응답에는 key 값 자체가 아니라 설정 여부만 포함합니다.

```json
{
  "enabled": true,
  "serviceKeyConfigured": true,
  "baseUrlConfigured": true,
  "schedulerEnabled": false,
  "cron": "0 0 3 * * *",
  "defaultPageSize": 100,
  "maxPagesPerRun": 1,
  "lastSyncStartedAt": null,
  "lastSyncStatus": null
}
```

### Dry-Run

```http
POST /api/admin/sync/stores/openapi/dry-run
Content-Type: application/json
```

```json
{
  "sidoName": "서울특별시",
  "sigunguName": "강남구",
  "pageNo": 1,
  "pageSize": 50,
  "maxPages": 1
}
```

dry-run은 OpenAPI 호출과 응답 parsing, row validation을 수행하지만 `stores` table에는 저장하지 않습니다.

### 실제 반영

```http
POST /api/admin/sync/stores/openapi
Content-Type: application/json
```

```json
{
  "sidoName": "서울특별시",
  "sigunguName": "강남구",
  "dongName": "역삼동",
  "categoryLargeCode": "Q",
  "pageNo": 1,
  "pageSize": 50,
  "maxPages": 1,
  "dryRun": false
}
```

실제 반영은 `external_store_id + source_system` 기준으로 insert/update를 수행합니다.

Backend client는 `/storeListInDong` operation을 사용합니다. 화면/API 요청은 `sidoName`, `sigunguName`, `dongName`처럼 사람이 읽기 쉬운 지역명을 받지만, 실제 공공데이터 호출 전 `regions` table에서 행정구역 코드를 찾아 `divId`와 `key`로 변환합니다.

- `dongName`이 있으면 `divId=adongCd`, `key=행정동코드`
- `sigunguName`까지만 있으면 `divId=signguCd`, `key=시군구코드`
- `sidoName`만 있으면 `divId=ctprvnCd`, `key=시도코드`

가이드 기준으로 모든 점포 조회 요청은 `type=xml`을 사용하고 `numOfRows`는 최대 1000으로 제한합니다. 초기 기본 요청은 `storeListInDong?divId=signguCd&key=11680&numOfRows=100&pageNo=1&type=xml`입니다.

지원하는 OpenAPI operation:

- `storeListInDong`: 행정구역 코드 기준 점포 조회
- `storeListInRadius`: 지도 중심 좌표 기준 반경 내 점포 조회, `radius` 최대 2000m
- `storeListByDate`: 수정일자 기준 신규/수정 점포 조회, `key` 또는 `changedDate`는 `YYYYMMDD`

응답 예시:

```json
{
  "syncLogId": 12,
  "status": "SUCCESS",
  "dryRun": false,
  "requestedPages": 1,
  "fetchedRows": 50,
  "successRows": 50,
  "failedRows": 0,
  "skippedRows": 0,
  "insertedRows": 42,
  "updatedRows": 8,
  "message": "OpenAPI 동기화가 완료되었습니다.",
  "errors": []
}
```

## Scheduler

예약 동기화는 기본 비활성화입니다. 원치 않는 외부 API 호출과 quota 소모를 막기 위해 local profile에서도 자동 실행하지 않는 설정을 권장합니다.

활성화 방법:

- 환경변수: `STORE_OPENAPI_SCHEDULER_ENABLED=true`
- 개발용 API: `PATCH /api/admin/sync/openapi/schedule`

개발용 schedule API:

```json
{
  "schedulerEnabled": true
}
```

스케줄러는 기본 operation, page size, max pages 설정으로 제한된 동기화만 실행합니다. 동시에 여러 동기화가 겹치지 않도록 실행 중 flag와 `sync_logs`의 `RUNNING` 상태를 확인합니다.

## Sync Logs

OpenAPI 동기화 결과는 CSV import와 같은 `sync_logs` table에 기록합니다.

- `sync_type`: `STORE_OPENAPI_SYNC`
- `status`: `RUNNING`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`
- `dry_run`: dry-run 여부
- `total_rows`: OpenAPI에서 가져온 row 수
- `success_rows`, `failed_rows`, `skipped_rows`
- `message`, `error_summary`

조회 API:

- `GET /api/admin/sync/logs`
- `GET /api/admin/sync/logs/{id}`

## 오류 처리 정책

- `localbiz.store-openapi.service-key`가 없으면 400 응답을 반환합니다.
- `STORE_OPENAPI_BASE_URL`은 기본값 `https://apis.data.go.kr/B553077/api/open/sdsc2`를 사용하며, 공공데이터포털 명세가 달라지면 환경변수로 재정의합니다.
- `STORE_OPENAPI_ENABLED=false`이면 수동 동기화 API도 실행하지 않습니다.
- 외부 OpenAPI 호출 실패는 `FAILED` sync log로 기록합니다.
- 일부 row validation 실패는 전체 작업을 중단하지 않고 `PARTIAL_SUCCESS`로 기록합니다.
- 실패 요약은 설정된 최대 개수만 응답과 `sync_logs.error_summary`에 남깁니다.
- key 값은 response, error message, log에 출력하지 않습니다.

## 현재 한계

- 전체 전국 데이터를 한 번에 수집하지 않습니다.
- 공공데이터포털의 상세 endpoint와 parameter 명세는 활용 신청 후 확인한 값에 맞춰 `StoreOpenApiClient`에서 조정할 수 있게 분리했습니다.
- retry/backoff는 아직 없습니다.
- 증분 동기화 기준은 아직 없습니다.
- 관리자 인증/인가는 아직 없습니다.
- 대용량 page 처리와 batch 최적화는 아직 없습니다.

## 향후 계획

- 대용량 page 처리 최적화
- retry/backoff와 API quota 대응
- 실패 row 다운로드
- 관리자 인증/인가
- 증분 동기화
- 서울시 유동인구/추정매출 데이터 연동
