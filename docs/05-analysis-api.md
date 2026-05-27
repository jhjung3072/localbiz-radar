# Analysis API

## 개요

Analysis API는 현재 `stores` table의 개발용 seed data를 기반으로 대시보드와 상권 분석 화면에 필요한 지표를 계산합니다. 실제 유동인구, 추정매출, 상권 영역 데이터는 아직 반영하지 않습니다.

프론트엔드는 공공 API를 직접 호출하지 않고 Spring Boot API만 호출합니다. 실제 공공 데이터 sync는 이후 backend client와 배치/캐시 계층에서 진행합니다.

## API 목록

### GET /api/analysis/summary

요약 지표를 조회합니다.

Query parameter:

- `sido`: 시도
- `sigungu`: 시군구
- `dong`: 행정동
- `categoryLargeCode`: 업종 대분류 코드
- `categoryMediumCode`: 업종 중분류 코드
- `categorySmallCode`: 업종 소분류 코드

응답 예시:

```json
{
  "totalStores": 10,
  "totalCategories": 7,
  "topCategoryName": "커피전문점",
  "competitionIndex": 30.0,
  "categoryDiversityScore": 70.0,
  "localBizScore": 66.5,
  "selectedRegionLabel": "서울특별시 마포구",
  "selectedCategoryLabel": "전체 업종"
}
```

### GET /api/analysis/category-distribution

업종별 점포 수와 비율을 조회합니다.

Query parameter:

- `sido`, `sigungu`, `dong`: 지역 필터
- `depth`: `large`, `medium`, `small`, 기본값 `small`

응답 예시:

```json
[
  {
    "categoryCode": "Q12A01",
    "categoryName": "커피전문점",
    "storeCount": 2,
    "ratio": 20.0
  }
]
```

### GET /api/analysis/competition

선택 지역 또는 좌표 반경 기준으로 경쟁 점포 수를 계산합니다.

Query parameter:

- `sido`, `sigungu`, `dong`: 지역 기준 필터
- `categoryLargeCode`, `categoryMediumCode`, `categorySmallCode`: 업종 기준 필터
- `lat`, `lng`, `radius`: 좌표 반경 기준 필터, `radius` 기본값은 `500` meter

지역 조건이 있으면 지역 기준을 우선 적용합니다. 좌표 반경 계산은 PostGIS 없이 Haversine 공식을 사용한 개발용 근사 계산입니다.

### POST /api/analysis/compare

후보 지역 A/B를 비교합니다.

Request body 예시:

```json
{
  "base": {
    "sido": "서울특별시",
    "sigungu": "마포구"
  },
  "target": {
    "sido": "서울특별시",
    "sigungu": "성동구"
  }
}
```

## 지표 계산 방식

- `totalStores`: 조건에 맞는 점포 수
- `totalCategories`: 조건에 맞는 distinct `categorySmallCode` 수
- `topCategoryName`: 점포 수가 가장 많은 소분류 업종명
- `competitionIndex`: 전체 점포 중 최다 업종이 차지하는 비율을 0-100으로 환산
- `categoryDiversityScore`: distinct 소분류 업종 수를 전체 점포 수 대비 0-100으로 환산
- `localBizScore`: 점포량 점수, 업종 다양성, 낮은 경쟁도를 가중 합산한 임시 점수

데이터가 없으면 점포 수와 점수는 모두 `0` 기반으로 반환합니다.

## 현재 한계

- 개발용 seed data만 사용합니다.
- 실제 유동인구, 추정매출, 상권 영역, 임대료, 시간대별 방문 데이터는 반영하지 않습니다.
- 좌표 반경 계산은 GIS 정밀 분석이 아니라 Haversine 기반 근사값입니다.
- PostGIS와 Hibernate Spatial은 아직 사용하지 않습니다.

## 향후 계획

- 공공 상가업소 데이터 sync
- 유동인구와 추정매출 데이터 연동
- 분석 지표 정규화 기준 개선
- 캐시와 배치 동기화 정책 추가
- 지도 SDK 도입 이후 공간 분석 고도화
