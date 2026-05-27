# CSV 데이터 동기화

## 개요

CSV 데이터 동기화 기능은 소상공인 상가정보 CSV 파일을 Spring Boot API로 업로드하고, CSV row를 `stores` table에 반영하는 개발용 import 도구입니다. OpenAPI 동기화는 별도 기능으로 제공하며, 이 문서는 CSV import 흐름만 다룹니다. 인증/인가는 아직 구현하지 않습니다.

프론트엔드는 `/data-sync` 화면에서 Spring Boot API만 호출합니다. 공공 데이터 API service key는 프론트엔드에 노출하지 않습니다.

## CSV 준비

소상공인시장진흥공단 상가정보 CSV를 내려받은 뒤 UTF-8 CSV 형식으로 준비합니다. 로컬 데모에는 다음 샘플 파일을 사용할 수 있습니다.

- `docs/samples/store-import-sample.csv`

## 지원 header

우선 지원하는 header는 다음과 같습니다.

- `상가업소번호`
- `상호명`
- `지점명`
- `상권업종대분류코드`
- `상권업종대분류명`
- `상권업종중분류코드`
- `상권업종중분류명`
- `상권업종소분류코드`
- `상권업종소분류명`
- `시도명`
- `시군구명`
- `행정동명`
- `지번주소`
- `도로명주소`
- `경도`
- `위도`

일부 header는 alias를 허용합니다.

- `상가업소번호`: `상가업소관리번호`
- `지점명`: `지점명칭`
- `행정동명`: `법정동명`

## Dry-Run

dry-run은 DB 저장 없이 CSV parsing과 row validation만 수행합니다.

```bash
curl -F "file=@docs/samples/store-import-sample.csv" \
  "http://localhost:8080/api/admin/sync/stores/csv?dryRun=true"
```

응답에는 총 row, 성공 row, 실패 row, 실패 row 요약이 포함됩니다.

## 실제 반영

실제 반영은 `dryRun=false`로 실행합니다.

```bash
curl -F "file=@docs/samples/store-import-sample.csv" \
  "http://localhost:8080/api/admin/sync/stores/csv?dryRun=false"
```

반영 기준:

- `source_system`: 기본값 `SMALL_BUSINESS_CSV`
- `external_store_id`: CSV의 `상가업소번호`
- 같은 `source_system + external_store_id`가 있으면 update
- 없으면 insert

import 후 `/stores`, `/dashboard`, `/analysis`, `/map`에서 반영된 데이터를 확인할 수 있습니다.

## Sync Logs

CSV import 결과는 `sync_logs` table에 저장합니다. OpenAPI 동기화도 같은 table을 사용하므로 `sync_type`으로 유형을 구분합니다.

주요 필드:

- `sync_type`: CSV import는 `STORE_CSV_IMPORT`, OpenAPI 동기화는 `STORE_OPENAPI_SYNC`
- `status`: `RUNNING`, `SUCCESS`, `PARTIAL_SUCCESS`, `FAILED`
- `dry_run`: 검증만 실행 여부
- `total_rows`, `success_rows`, `failed_rows`, `skipped_rows`
- `started_at`, `finished_at`
- `message`, `error_summary`

조회 API:

- `GET /api/admin/sync/logs`
- `GET /api/admin/sync/logs/{id}`

## 오류 처리 정책

- 파일이 비어 있으면 400 응답을 반환합니다.
- `.csv` 확장자가 아니면 400 응답을 반환합니다.
- `maxRowsPerImport`를 초과하면 초과 지점에서 처리를 중단하고, 처리된 row와 실패 요약을 기준으로 `PARTIAL_SUCCESS` 또는 `FAILED`로 기록합니다.
- 필수값이 없는 row는 실패 row로 처리하고 전체 import는 계속 진행합니다.
- 위도/경도 parsing 실패 row는 지도 품질을 위해 실패 row로 처리합니다.
- 실패 row 요약은 설정된 최대 개수까지만 응답과 `sync_logs.error_summary`에 남깁니다.

## 환경 변수

```bash
LOCALBIZ_STORE_SYNC_MAX_ROWS_PER_IMPORT=5000
LOCALBIZ_STORE_SYNC_MAX_FILE_SIZE_BYTES=20971520
LOCALBIZ_STORE_SYNC_FAIL_FAST=false
LOCALBIZ_STORE_SYNC_DEFAULT_SOURCE_SYSTEM=SMALL_BUSINESS_CSV
LOCALBIZ_STORE_SYNC_MAX_ERROR_SUMMARY_COUNT=20
```

## 현재 한계

- CSV import 자체에는 외부 OpenAPI 호출이 없습니다.
- 관리자 인증/인가는 아직 없습니다.
- 대용량 import 성능 최적화는 아직 없습니다.
- 실패 row 다운로드는 아직 없습니다.

## 향후 계획

- OpenAPI 동기화와 CSV import의 공통 실패 row 다운로드
- 관리자 인증/인가
- 대용량 import 최적화
- 실패 row 다운로드
