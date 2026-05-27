# Store/Region API

## 개요

Store/Region API는 `/stores` 화면의 점포 목록, 지역 필터, 업종 필터를 지원하는 내부 API입니다. 현재 데이터는 실제 공공 API 데이터가 아니라 Flyway migration으로 주입한 개발용 seed data입니다.

## 실행 방법

```bash
docker compose up -d
pnpm dev:api
pnpm dev:web
```

Swagger UI:

- `http://localhost:8080/swagger-ui/index.html`

## API 목록

### GET /api/stores

점포 목록을 페이지 단위로 조회합니다.

Query parameter:

- `keyword`: `storeName`, `roadAddress`, `lotAddress` 부분 검색
- `sido`: 시도 exact match
- `sigungu`: 시군구 exact match
- `dong`: 행정동 exact match
- `categoryLargeCode`: 업종 대분류 코드 exact match
- `categoryMediumCode`: 업종 중분류 코드 exact match
- `categorySmallCode`: 업종 소분류 코드 exact match
- `page`: 기본값 `0`
- `size`: 기본값 `20`, 최대 `100`

응답 예시:

```json
{
  "content": [
    {
      "id": 1,
      "storeName": "역삼 모닝커피",
      "categoryLargeCode": "Q",
      "categoryLargeName": "음식",
      "categoryMediumCode": "Q12",
      "categoryMediumName": "카페",
      "categorySmallCode": "Q12A01",
      "categorySmallName": "커피전문점",
      "sido": "서울특별시",
      "sigungu": "강남구",
      "dong": "역삼동",
      "roadAddress": "서울특별시 강남구 테헤란로 128",
      "latitude": 37.4991240,
      "longitude": 127.0328920
    }
  ],
  "page": 0,
  "size": 20,
  "totalElements": 1,
  "totalPages": 1
}
```

### GET /api/stores/{id}

점포 상세 정보를 조회합니다. 현재 상세 화면은 없지만 이후 지도 상세 패널에서 사용할 수 있습니다.

### GET /api/stores/categories

업종 필터에 사용할 대분류, 중분류, 소분류 계층을 조회합니다.

### GET /api/stores/map

지도 marker 표시에 사용할 점포 목록을 조회합니다. 좌표가 없는 점포는 응답에서 제외합니다.

Query parameter:

- `sido`, `sigungu`, `dong`: 지역 exact match
- `categoryLargeCode`, `categoryMediumCode`, `categorySmallCode`: 업종 코드 exact match
- `minLat`, `maxLat`, `minLng`, `maxLng`: 네 값이 모두 있을 때 viewport 필터 적용
- `limit`: 기본값 `300`, 최대 `1000`

### GET /api/stores/nearby

입력 좌표와 반경 기준 주변 점포를 거리순으로 조회합니다. PostGIS는 아직 사용하지 않고 Haversine 공식을 사용한 개발용 근사 계산으로 처리합니다.

Query parameter:

- `lat`: 필수, `-90` 이상 `90` 이하
- `lng`: 필수, `-180` 이상 `180` 이하
- `radius`: meter 단위, 기본값 `500`, `100` 이상 `3000` 이하
- `categoryLargeCode`, `categoryMediumCode`, `categorySmallCode`: 업종 코드 exact match
- `limit`: 기본값 `100`, 최대 `500`

### GET /api/regions

지역 필터에 사용할 시도, 시군구, 행정동 계층을 조회합니다.

## 로컬 확인 예시

```bash
curl "http://localhost:8080/api/stores?keyword=커피&sido=서울특별시&page=0&size=10"
curl "http://localhost:8080/api/stores/categories"
curl "http://localhost:8080/api/regions"
curl "http://localhost:8080/api/stores/map?sido=서울특별시&sigungu=강남구"
curl "http://localhost:8080/api/stores/nearby?lat=37.497952&lng=127.027619&radius=500"
```

## 보안 원칙

프론트엔드는 `NEXT_PUBLIC_API_BASE_URL`로 Spring Boot API만 호출합니다. 공공 API 서비스 키와 공공 API endpoint는 프론트엔드에 두지 않습니다. 실제 공공 데이터 sync는 다음 phase에서 backend client를 통해서만 진행합니다.
