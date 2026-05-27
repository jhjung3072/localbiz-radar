# 지도 기능

## 개요

지도 기능은 개발용 `stores` seed data의 위도/경도를 Kakao Maps 위에 표시합니다. 현재 단계에서는 실제 공공 API 동기화 데이터, 인증, PostGIS, 행정동 경계 polygon을 사용하지 않습니다.

프론트엔드는 Spring Boot API만 호출합니다. 공공 데이터 API service key는 프론트엔드에 두지 않습니다.

## Kakao Maps JavaScript Key

`NEXT_PUBLIC_KAKAO_MAP_APP_KEY`는 Kakao Maps JavaScript SDK 로딩에 필요한 브라우저 client key입니다. 이 값은 공공 데이터 API service key와 다르며, Kakao Developers에서 JavaScript SDK 도메인 제한을 설정해 사용합니다.

`apps/web/.env.local` 예시:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_KAKAO_MAP_APP_KEY=your-kakao-javascript-key
```

실제 key 값은 커밋하지 않습니다. `PUBLIC_DATA_SERVICE_KEY` 같은 공공 데이터 service key는 `NEXT_PUBLIC_*` 환경 변수로 관리하지 않습니다.

## API 목록

### GET /api/stores/map

지도 marker용 점포 목록을 반환합니다.

Query parameter:

- `sido`, `sigungu`, `dong`: 지역 필터
- `categoryLargeCode`, `categoryMediumCode`, `categorySmallCode`: 업종 필터
- `minLat`, `maxLat`, `minLng`, `maxLng`: viewport 필터
- `limit`: 기본값 `300`, 최대 `1000`

좌표가 없는 점포는 응답에서 제외합니다.

### GET /api/stores/nearby

지도 중심 좌표와 반경 기준 주변 점포를 거리순으로 반환합니다.

Query parameter:

- `lat`: 필수, 위도
- `lng`: 필수, 경도
- `radius`: meter 단위, 기본값 `500`, 최대 `3000`
- `categoryLargeCode`, `categoryMediumCode`, `categorySmallCode`: 업종 필터
- `limit`: 기본값 `100`, 최대 `500`

응답에는 `distanceMeters`가 포함됩니다.

## 프론트엔드 구조

```text
apps/web/src/app/map/page.tsx
apps/web/src/features/map/api/map-api.ts
apps/web/src/features/map/api/map-query-keys.ts
apps/web/src/features/map/components/store-map.tsx
apps/web/src/features/map/components/map-filter-panel.tsx
apps/web/src/features/map/components/store-detail-panel.tsx
apps/web/src/features/map/components/nearby-search-panel.tsx
apps/web/src/features/map/components/map-empty-state.tsx
apps/web/src/features/map/components/map-error-state.tsx
```

## 반경 검색 계산 방식

현재 반경 검색은 PostGIS 없이 다음 방식으로 처리합니다.

- 요청 좌표와 반경을 기준으로 대략적인 bounding box를 계산합니다.
- Spring Data JPA Specification으로 좌표가 있는 후보 점포를 먼저 조회합니다.
- Service 계층에서 Haversine 공식으로 거리를 계산합니다.
- 반경 이내 점포만 남기고 `distanceMeters` 오름차순으로 정렬합니다.

이 계산은 개발용 근사 검색입니다. 실제 GIS 수준의 정밀 검색은 이후 PostGIS 기반 공간 검색 단계에서 개선합니다.

## 현재 한계

- 개발용 seed data만 사용합니다.
- marker clustering은 아직 없습니다.
- 행정동 경계 polygon은 아직 표시하지 않습니다.
- 좌표 품질 보정과 지오코딩 흐름은 아직 없습니다.
- 반경 검색은 Haversine 근사 계산이며 대량 데이터 성능 최적화는 아직 없습니다.

## 추후 개선 계획

- marker clustering 추가
- 행정동 경계 polygon 표시
- PostGIS 기반 공간 검색
- 지도 viewport 캐싱과 marker 성능 최적화
- 공공 데이터 동기화 이후 좌표 품질 검증
