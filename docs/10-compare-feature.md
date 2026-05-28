# 후보 지역 비교 기능

## 개요

후보 지역 비교 기능은 기준 지역과 비교 지역을 선택해 점포 수, 관심 업종 비중, 경쟁 강도, 업종 다양성, 점포 밀도, LocalBiz 점수를 나란히 비교하는 화면입니다.

현재 지표는 `stores` table의 점포 데이터 기반 개발용 지표입니다. 실제 유동인구, 추정매출, 임대료, 상권 경계 데이터는 아직 반영하지 않습니다.

## 사용자 시나리오

1. `/compare` 화면에 접속합니다.
2. 기준 지역과 비교 지역을 시도, 시군구, 행정동 순서로 선택합니다.
3. 필요하면 관심 업종을 대분류, 중분류, 소분류 순서로 선택합니다.
4. `비교하기`를 눌러 추천 지역, 추천 사유, A/B 지표 카드, 차트, 지역 랭킹을 확인합니다.
5. URL을 공유하거나 새로고침해도 선택 조건이 유지됩니다.
6. 최근 비교 조건은 브라우저에 최대 5개까지 저장되며 다시 선택할 수 있습니다.

## API 목록

### POST /api/analysis/compare

기준 지역과 비교 지역의 분석 지표를 계산합니다.

Request 예시:

```json
{
  "base": {
    "ctprvnCd": "11",
    "ctprvnNm": "서울특별시",
    "signguCd": "11680",
    "signguNm": "강남구",
    "adongCd": "11680640",
    "adongNm": "역삼1동"
  },
  "target": {
    "ctprvnCd": "11",
    "ctprvnNm": "서울특별시",
    "signguCd": "11440",
    "signguNm": "마포구",
    "adongCd": "11440660",
    "adongNm": "서교동"
  },
  "category": {
    "indsLclsCd": "I2",
    "indsLclsNm": "음식점",
    "indsMclsCd": "I201",
    "indsMclsNm": "한식"
  }
}
```

Response 예시:

```json
{
  "base": {
    "regionLabel": "서울특별시 강남구 역삼1동",
    "totalStores": 1234,
    "categoryStoreCount": 230,
    "categoryShare": 18.6,
    "totalCategories": 74,
    "competitionIndex": 82.0,
    "categoryDiversityScore": 71.0,
    "densityScore": 64.0,
    "localBizScore": 73.0,
    "topCategories": [
      {
        "categoryCode": "I20102",
        "categoryName": "국/탕/찌개류",
        "storeCount": 42,
        "ratio": 18.2
      }
    ]
  },
  "target": {
    "regionLabel": "서울특별시 마포구 서교동",
    "totalStores": 980,
    "categoryStoreCount": 170,
    "categoryShare": 17.3,
    "totalCategories": 81,
    "competitionIndex": 76.0,
    "categoryDiversityScore": 78.0,
    "densityScore": 69.0,
    "localBizScore": 76.0,
    "topCategories": []
  },
  "winner": {
    "regionLabel": "서울특별시 마포구 서교동",
    "scoreGap": 3.0,
    "reason": "업종 다양성과 점포 밀도 점수가 더 높아 후보 지역으로 더 적합합니다."
  },
  "metricComparisons": [
    {
      "metricKey": "localBizScore",
      "metricName": "LocalBiz 점수",
      "baseValue": 73.0,
      "targetValue": 76.0,
      "winner": "TARGET"
    }
  ]
}
```

기존 `sido`, `sigungu`, `dong` 명칭 기반 요청도 호환합니다. 코드와 명칭이 함께 전달되면 코드 기반 필터를 우선 적용하고, 부족한 경우 명칭 기반으로 fallback합니다.

### GET /api/analysis/region-ranking

선택 업종 기준으로 지역별 LocalBiz 점수 랭킹을 조회합니다.

Query parameter:

- `ctprvnCd`: 시도 코드, 기본값 `11`
- `signguCd`: 시군구 코드
- `groupBy`: `SIGUNGU` 또는 `ADMIN_DONG`, 기본값 `SIGUNGU`
- `indsLclsCd`: 업종 대분류 코드
- `indsMclsCd`: 업종 중분류 코드
- `indsSclsCd`: 업종 소분류 코드
- `limit`: 반환 개수, 기본값 `10`, 최대 `50`

정렬 기준:

1. `localBizScore` 내림차순
2. `categoryStoreCount` 내림차순
3. `totalStores` 내림차순
4. `regionLabel` 오름차순

## 지표 계산 방식

- `totalStores`: 해당 지역 전체 점포 수
- `categoryStoreCount`: 선택 업종 조건에 해당하는 점포 수
- `categoryShare`: `categoryStoreCount / totalStores * 100`
- `totalCategories`: distinct 소분류 업종 수
- `competitionIndex`: 선택 업종 또는 최다 업종이 해당 지역에서 차지하는 비율을 0-100으로 환산
- `categoryDiversityScore`: 업종 다양성을 0-100 사이 값으로 정규화
- `densityScore`: 현재는 점포 수를 기준으로 계산하는 개발용 밀도 점수
- `localBizScore`: 경쟁 강도, 업종 다양성, 점포 밀도를 조합한 개발용 상권 점수

데이터가 없는 지역은 모든 count와 score를 `0`으로 반환합니다. 0으로 나누는 상황은 `0` 점수로 처리합니다.

## URL Query Sync

`/compare` 화면은 선택 조건을 URL query parameter로 유지합니다.

예시:

```text
/compare?baseSido=11&baseSigungu=11680&targetSido=11&targetSigungu=11440&large=I2&medium=I201
```

주요 parameter:

- `baseSido`, `baseSigungu`, `baseDong`
- `targetSido`, `targetSigungu`, `targetDong`
- `large`, `medium`, `small`

URL에는 코드 값을 저장하고, 화면 label은 마스터 데이터에서 조회한 명칭을 사용합니다.

## 최근 비교 조건

최근 비교 조건은 서버 DB에 저장하지 않고 브라우저 localStorage에만 저장합니다.

- storage key: `localbiz-radar:recent-comparisons`
- 최대 저장 개수: 5개
- 동일 조건은 중복 저장하지 않음
- 클릭하면 form 조건과 URL query가 함께 갱신됨

## Frontend 구성

- `apps/web/src/app/compare/page.tsx`
- `apps/web/src/features/compare/components/compare-condition-form.tsx`
- `apps/web/src/features/compare/components/region-select-group.tsx`
- `apps/web/src/features/compare/components/category-select-group.tsx`
- `apps/web/src/features/compare/components/winner-insight-card.tsx`
- `apps/web/src/features/compare/components/comparison-chart.tsx`
- `apps/web/src/features/compare/components/comparison-radar-chart.tsx`
- `apps/web/src/features/compare/components/region-ranking-table.tsx`

지역/업종 선택은 `GET /api/master/regions`, `GET /api/master/categories` 결과를 사용합니다. 프론트엔드는 공공데이터 OpenAPI를 직접 호출하지 않습니다.

## 테스트 방법

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

1. `http://localhost:3000/compare`에 접속합니다.
2. 기준 지역과 비교 지역을 선택합니다.
3. 필요하면 관심 업종을 선택합니다.
4. `비교하기`를 눌러 추천 지역, 차트, 랭킹이 표시되는지 확인합니다.
5. 새로고침 후 URL query로 조건이 복원되는지 확인합니다.
6. 최근 비교 조건 버튼으로 이전 조건을 다시 불러오는지 확인합니다.

검증 명령:

```bash
pnpm run ci
```

## 현재 한계와 향후 계획

- 현재 점수는 점포 데이터 기반 개발용 지표입니다.
- 유동인구, 추정매출, 임대료, 상권 경계 데이터는 아직 반영하지 않습니다.
- 최근 비교 조건은 브라우저 localStorage에만 저장합니다.
- 향후 유동인구/추정매출 반영, 즐겨찾기 저장, PDF/Excel export, Next.js BFF 기반 화면 aggregation, 관리자/사용자 인증을 별도 단계에서 검토합니다.
