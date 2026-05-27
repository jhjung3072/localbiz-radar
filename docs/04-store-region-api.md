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

### GET /api/regions

지역 필터에 사용할 시도, 시군구, 행정동 계층을 조회합니다.

## 로컬 확인 예시

```bash
curl "http://localhost:8080/api/stores?keyword=커피&sido=서울특별시&page=0&size=10"
curl "http://localhost:8080/api/stores/categories"
curl "http://localhost:8080/api/regions"
```

## 보안 원칙

프론트엔드는 `NEXT_PUBLIC_API_BASE_URL`로 Spring Boot API만 호출합니다. 공공 API 서비스 키와 공공 API endpoint는 프론트엔드에 두지 않습니다. 실제 공공 데이터 sync는 다음 phase에서 backend client를 통해서만 진행합니다.
