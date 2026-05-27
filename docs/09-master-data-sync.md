# 마스터 데이터 동기화

## 개요

행정구역/업종 코드 마스터 동기화는 소상공인시장진흥공단_상가(상권)정보 OpenAPI의 실제 활용가이드 오퍼레이션을 사용해 필터용 코드 체계를 저장하는 기능입니다.

프론트엔드는 공공데이터 OpenAPI를 직접 호출하지 않습니다. `/data-sync` 화면은 Spring Boot 내부 API만 호출하고, service key는 `apps/api/src/main/resources/application.yml`의 `localbiz.store-openapi.service-key`에서 읽습니다. key 값은 응답, 로그, 에러 메시지에 출력하지 않습니다.

## 사용하는 OpenAPI 오퍼레이션

Base URL:

```text
https://apis.data.go.kr/B553077/api/open/sdsc2
```

공통 파라미터:

- `serviceKey`: `application.yml`의 `localbiz.store-openapi.service-key`
- `type`: 기본 `xml`

Backend client는 기본적으로 OpenAPI 요청 사이에 `localbiz.store-openapi.request-interval-millis`만큼 대기합니다. 기본값은 1000ms입니다.

행정구역:

- `GET /baroApi?resId=dong&catId=mega&type=xml&serviceKey=...`
- `GET /baroApi?resId=dong&catId=cty&ctprvnCd=11&type=xml&serviceKey=...`
- `GET /baroApi?resId=dong&catId=admi&signguCd=11680&type=xml&serviceKey=...`
- `GET /baroApi?resId=dong&catId=zone&signguCd=11680&type=xml&serviceKey=...`

업종:

- `GET /largeUpjongList?type=xml&serviceKey=...`
- `GET /middleUpjongList?indsLclsCd=I2&type=xml&serviceKey=...`
- `GET /smallUpjongList?indsLclsCd=I2&indsMclsCd=I201&type=xml&serviceKey=...`

응답은 `response.header.resultCode`가 `00`일 때만 성공으로 처리합니다.
업종 중/소분류 파라미터는 optional이므로, 전체 동기화에서는 반복 호출을 줄이기 위해 중분류와 소분류를 각각 가능한 한 번에 조회하고 내부에서 `maxMediumCount`, `maxSmallCountPerMedium` 제한을 적용합니다.

## 응답 필드 매핑

행정구역:

| OpenAPI field | DB field |
| --- | --- |
| `ctprvnCd` | `ctprvn_cd`, `code` for `SIDO` |
| `ctprvnNm` | `ctprvn_nm`, `name` for `SIDO` |
| `signguCd` | `signgu_cd`, `code` for `SIGUNGU` |
| `signguNm` | `signgu_nm`, `name` for `SIGUNGU` |
| `adongCd` | `adong_cd`, `code` for `ADMIN_DONG` |
| `adongNm` | `adong_nm`, `name` for `ADMIN_DONG` |
| `ldongCd` | `ldong_cd`, `code` for `LEGAL_DONG` |
| `ldongNm` | `ldong_nm`, `name` for `LEGAL_DONG` |
| `stdrDt` | `standard_date` |

업종:

| OpenAPI field | DB field |
| --- | --- |
| `indsLclsCd` | `inds_lcls_cd`, `code` for `LARGE` |
| `indsLclsNm` | `inds_lcls_nm`, `name` for `LARGE` |
| `indsMclsCd` | `inds_mcls_cd`, `code` for `MEDIUM` |
| `indsMclsNm` | `inds_mcls_nm`, `name` for `MEDIUM` |
| `indsSclsCd` | `inds_scls_cd`, `code` for `SMALL` |
| `indsSclsNm` | `inds_scls_nm`, `name` for `SMALL` |
| `stdrDt` | `standard_date` |

## DB 테이블

- `region_masters`: `region_type + code` unique index
- `category_masters`: `category_level + code` unique index

기존 `regions` table은 삭제하지 않고 호환성을 유지합니다. 기존 `GET /api/regions`, `GET /api/stores/categories`는 마스터 데이터가 있으면 마스터 테이블을 사용하고, 없으면 기존 데이터 기반 조회로 fallback합니다.

## 내부 API

관리자 동기화 API:

- `POST /api/admin/sync/master/regions/openapi`
- `POST /api/admin/sync/master/categories/openapi`
- `GET /api/admin/sync/master/status`

공개 조회 API:

- `GET /api/master/regions`
- `GET /api/master/categories`

예시 요청:

```json
{
  "ctprvnCd": "11",
  "includeSigungu": true,
  "includeAdminDong": true,
  "includeLegalDong": false,
  "dryRun": true,
  "maxSigunguCount": 25,
  "maxDongCountPerSigungu": 50
}
```

```json
{
  "includeLarge": true,
  "includeMedium": true,
  "includeSmall": true,
  "dryRun": true,
  "maxLargeCount": 20,
  "maxMediumCount": 200,
  "maxSmallCountPerMedium": 100
}
```

## Dry-Run과 실제 반영

dry-run은 OpenAPI 호출, XML parsing, row validation만 수행하고 DB에는 저장하지 않습니다. 실제 반영은 `region_masters`, `category_masters`에 upsert하고 `sync_logs`에 결과를 기록합니다.

마스터 sync type:

- `REGION_MASTER_OPENAPI_SYNC`
- `CATEGORY_MASTER_OPENAPI_SYNC`

## Frontend 필터 적용

`/stores`, `/map`, `/analysis`, `/data-sync`의 지역/업종 필터는 코드 값을 option value로 사용합니다.

- 시도: `ctprvnCd`
- 시군구: `signguCd`
- 행정동: `adongCd`
- 대분류: `indsLclsCd`
- 중분류: `indsMclsCd`
- 소분류: `indsSclsCd`

기존 Store/Analysis/Map API가 지역명을 받는 부분은 선택된 코드에 대응하는 명칭으로 변환해서 호출합니다.

## 테스트 방법

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

1. `application.yml`의 `localbiz.store-openapi.service-key`와 `enabled` 설정을 확인합니다.
2. `http://localhost:3000/data-sync`에 접속합니다.
3. 마스터 데이터 동기화 섹션에서 행정구역 dry-run을 실행합니다.
4. 실패가 없으면 실제 반영을 실행합니다.
5. 업종 코드도 같은 순서로 dry-run 후 실제 반영합니다.
6. `/stores`, `/map`, `/analysis`에서 지역/업종 필터 option이 반영되는지 확인합니다.

## 현재 한계와 향후 계획

- 기본 행정구역 동기화는 서울특별시 중심의 제한 호출입니다.
- 법정동은 기본 제외이며 필요할 때만 요청합니다.
- 공공데이터포털 429 응답이 발생하면 잠시 대기한 뒤 더 작은 범위로 재실행해야 합니다.
- 전국 전체 마스터 동기화는 API 호출량과 quota 정책을 정리한 뒤 진행합니다.
- 향후 retry/backoff, 실패 row 다운로드, 관리자 인증/인가, 증분 동기화 상태 관리를 추가합니다.
