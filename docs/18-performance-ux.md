# 지도/목록 대용량 UX 및 성능 최적화

## 기능 개요

이번 단계에서는 `/stores`와 `/map`에서 대량 점포 데이터를 다룰 때 렌더링 비용과 불필요한 API 호출을 줄이는 UX를 추가했다. 새로운 Spring Boot API는 만들지 않고, 기존 Store/Map API 응답을 frontend에서 더 효율적으로 표시한다.

## 왜 성능 최적화가 필요한지

점포 데이터가 수백 개에서 수천 개로 늘어나면 다음 문제가 생길 수 있다.

- 지도 marker DOM과 overlay가 한 번에 많이 생성된다.
- 목록 row가 많아져 스크롤과 hover 응답성이 떨어진다.
- 사용자가 검색어를 입력하는 동안 API 요청이 과하게 발생한다.
- 지도 이동 중 viewport 변경마다 API를 호출하면 네트워크와 UI가 불안정해진다.

이번 작업은 화면에 보이는 요소 중심 렌더링, marker clustering, debounce, React Query cache 전략으로 이 문제를 줄인다.

## Marker Clustering 전략

`/map`은 `react-kakao-maps-sdk`의 `MarkerClusterer`를 사용한다. Kakao Maps SDK는 `clusterer` library를 함께 로드한다.

적용 방식:

- 기본값은 `마커 묶기` enabled
- marker가 많으면 가까운 marker를 cluster로 묶어 표시
- selected marker는 cluster 밖에 별도로 렌더링해 상세 선택 상태를 유지
- cluster toggle 변경은 Sentry breadcrumb로 기록

지도 API는 기존 `GET /api/stores/map`을 그대로 사용한다. marker limit은 frontend 요청에서 1,000으로 제한하고, limit에 도달하면 사용자가 지도 확대나 필터 조정을 할 수 있도록 안내한다.

## Virtualized List 전략

목록 가상화는 `@tanstack/react-virtual`을 사용한다.

적용 대상:

- `/stores` 검색 결과 table body
- `/map` 지도 내 점포 목록
- `/map` 주변 점포 목록

전략:

- 실제 데이터 배열은 유지하되, 화면에 보이는 item과 overscan 범위만 DOM으로 렌더링한다.
- `/stores`는 기존 TanStack Table column 구조와 pagination을 유지한다.
- `/map` 목록 item 클릭 시 지도 중심 이동, marker highlight, 상세 패널 open 동작을 유지한다.
- selected item이 현재 스크롤 영역 밖에 있으면 가능한 경우 `scrollToIndex`로 중앙 근처에 맞춘다.

## Debounce Search 전략

검색어 입력은 `useDebouncedValue` hook으로 450ms 지연 반영한다.

동작:

- 사용자가 키워드를 빠르게 입력하면 마지막 값만 URL query와 API 요청에 반영한다.
- 기존 `검색` 버튼은 유지하며 버튼 클릭 시 즉시 검색 조건을 반영한다.
- 검색어 원문은 Sentry breadcrumb에 남기지 않고 길이와 존재 여부만 남긴다.

## React Query Cache/StaleTime 전략

기본 QueryClient 설정:

- `staleTime`: 60초
- `gcTime`: 5분
- `refetchOnWindowFocus`: false

화면별 조정:

- master region/category: `staleTime` 30분, `gcTime` 60분
- store list: normalized params 기반 query key, `placeholderData: keepPreviousData`, `staleTime` 30초
- map marker: normalized viewport/category/region params 기반 query key, `placeholderData: keepPreviousData`, `staleTime` 60초
- nearby search: normalized center/radius/category params 기반 query key, `placeholderData: keepPreviousData`, `staleTime` 30초

URL query object를 그대로 query key에 넣지 않고, `all`, 빈 문자열, 과도한 limit, 소수점 좌표를 정규화한 params를 사용한다.

## 지도 영역 검색 UX

지도 `idle` event가 발생해도 즉시 API를 호출하지 않는다. 지도 중심이나 bounds가 변경되면 `현재 지도 영역에서 검색` CTA를 표시하고, 사용자가 클릭했을 때만 `GET /api/stores/map` 조건을 갱신한다.

CTA 동작:

- pending viewport가 있을 때만 표시
- API 호출 중 loading 문구 표시
- 적용된 bounds와 같은 bounds는 중복 호출하지 않음
- 실행 시 Sentry breadcrumb와 browser performance mark 기록

## Sentry Breadcrumb 정책

다음 액션을 기록한다.

- stores debounce 검색 반영
- stores page 변경
- map marker cluster toggle 변경
- map bounds search 실행
- map marker click
- map list item click
- nearby search 실행

breadcrumb에는 token, cookie, public data service key, Sentry auth token을 포함하지 않는다. 검색어 원문도 넣지 않고 `hasKeyword`, `keywordLength`, count, boolean, code 수준의 값만 남긴다.

## 접근성 고려사항

- virtualized list item은 button을 사용해 keyboard 접근을 유지한다.
- 지도 marker 정보는 목록과 상세 패널에서도 확인할 수 있다.
- `마커 묶기` toggle은 label과 checkbox로 제공한다.
- 지도 overlay CTA는 keyboard focus 가능한 button이다.
- loading/error/empty 상태는 텍스트와 role로 의미를 전달한다.
- 성능 limit 안내는 `role="status"`로 제공한다.

## 테스트 방법

단위 테스트:

```bash
pnpm --filter web test:run
```

E2E 테스트:

```bash
pnpm --filter web e2e -- e2e/performance-ux.spec.ts
```

Storybook 빌드:

```bash
pnpm build-storybook:web
```

수동 확인:

1. `/stores`에서 검색어를 빠르게 입력한다.
2. 마지막 검색어만 URL query에 반영되는지 확인한다.
3. `/map`에서 `마커 묶기` toggle을 켜고 끈다.
4. 지도 점포 목록 item을 선택해 상세 패널과 marker 선택이 함께 바뀌는지 확인한다.
5. 지도를 이동한 뒤 `현재 지도 영역에서 검색` 버튼이 나타나는지 확인한다.
6. 후보 바구니와 `/compare` 이동 흐름이 기존처럼 동작하는지 확인한다.

## 현재 한계

- 서버 사이드 cursor pagination은 아직 없다.
- viewport 기반 incremental loading은 아직 없다.
- marker clustering은 Kakao Maps SDK clusterer에 의존한다.
- 거리 계산과 대량 가공을 Web Worker로 분리하지 않았다.
- Lighthouse/RUM 자동 측정은 아직 CI에 포함하지 않았다.

## 향후 개선 계획

- 서버 사이드 cursor pagination
- 지도 viewport 기반 incremental loading
- Web Worker 기반 거리 계산
- map marker canvas rendering
- Lighthouse 성능 측정 자동화
- RUM 지표 대시보드
