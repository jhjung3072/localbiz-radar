# API 전략

## 기본 방향

LocalBiz Radar의 실제 공공 데이터 연동은 Spring Boot 백엔드를 통해서만 추가합니다. 프론트엔드는 공공 API 서비스 키를 알지 못하며, 백엔드가 제공하는 내부 API를 호출합니다.

## 권장 흐름

```text
Next.js 화면
  -> Spring Boot 내부 API
  -> Store/Region/Analysis/Sync DB 조회 및 계산
  -> 현재 phase의 CSV import
  -> 이후 phase의 공공 API 클라이언트
  -> 공공 데이터 제공 기관
```

## 보안 원칙

- `PUBLIC_DATA_SERVICE_KEY`는 백엔드 환경 변수로만 관리합니다.
- 프론트엔드에서 공공 API 엔드포인트를 직접 호출하지 않습니다.
- 브라우저에 노출되는 `NEXT_PUBLIC_API_BASE_URL`에는 백엔드 기본 주소처럼 공개 가능한 값만 둡니다.
- 운영 환경에서는 키 회전과 접근 로그 확인 절차를 별도로 마련합니다.

## 현재 API 데이터

- `GET /api/stores`, `GET /api/stores/{id}`, `GET /api/stores/categories`, `GET /api/regions`를 제공합니다.
- `GET /api/stores/map`, `GET /api/stores/nearby`를 제공합니다.
- `GET /api/analysis/summary`, `GET /api/analysis/category-distribution`, `GET /api/analysis/competition`, `POST /api/analysis/compare`를 제공합니다.
- `POST /api/admin/sync/stores/csv`, `GET /api/admin/sync/logs`, `GET /api/admin/sync/logs/{id}`를 제공합니다.
- 현재 Store/Region 데이터는 Flyway migration으로 주입한 개발용 seed data입니다.
- 이번 단계의 데이터 추가는 실시간 OpenAPI 호출이 아니라 CSV 파일 기반 import입니다.
- Analysis API는 현재 내부 `stores` table 기반으로 점포 수, 업종 분포, 경쟁 지수, 다양성 점수, LocalBiz 점수를 계산합니다.
- 현재 분석 지표는 실제 유동인구, 추정매출, 상권 영역 데이터가 반영되지 않은 임시 지표입니다.
- 지도 API는 현재 `stores` table의 위도/경도 필드를 사용하며, 반경 검색은 PostGIS 없이 bounding box 후보 조회와 Haversine 근사 계산으로 처리합니다.
- 실제 공공 상가업소 데이터 동기화는 다음 phase에서 Spring Boot backend client와 배치/캐시 정책을 통해 진행합니다.
- `/stores`, `/dashboard`, `/analysis`, `/map` 화면은 공공 API가 아니라 Spring Boot 내부 API만 호출합니다.
- `/data-sync` 화면도 Spring Boot 내부 API만 호출하며, 공공 데이터 endpoint를 직접 호출하지 않습니다.

## 지도 키 정책

- `NEXT_PUBLIC_KAKAO_MAP_APP_KEY`는 Kakao Maps JavaScript SDK 로딩을 위한 브라우저 client key입니다.
- Kakao Developers에서 JavaScript SDK 도메인 제한을 설정해야 합니다.
- 이 키는 공공 데이터 API service key가 아니며, 상가업소 공공 데이터 조회 권한을 갖지 않습니다.
- `PUBLIC_DATA_SERVICE_KEY` 같은 공공 데이터 service key는 백엔드 환경 변수로만 관리하고 프론트엔드에 노출하지 않습니다.

## 백엔드 확장 계획

이후 단계에서 다음 계층을 순서대로 추가합니다.

- 공공 API 요청/응답 DTO
- 공공 API 클라이언트
- CSV import 이후 OpenAPI client
- Spring Scheduler 기반 주기적 동기화
- 캐시 또는 저장소 계층
- 검색, 필터, 집계용 내부 API
- 오류 처리, 재시도, 호출 제한 대응 정책

## 현재 구현 상태

현재 백엔드는 health, Store, Region, Analysis, 지도 조회, CSV 동기화 API를 제공합니다. 실제 공공 API 클라이언트와 스케줄러 자동 동기화는 아직 만들지 않습니다.
