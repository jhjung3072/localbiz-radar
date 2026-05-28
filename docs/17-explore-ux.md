# 통합 탐색 UX

## 기능 개요

통합 탐색 UX는 `/stores`, `/map`, `/compare` 사이의 흐름을 하나의 탐색 여정으로 연결한다. 사용자는 점포 목록에서 지역/업종/키워드 조건을 만들고, 같은 조건으로 지도에서 위치를 확인한 뒤, 관심 후보를 바구니에 담아 후보 지역 A/B 비교로 이동할 수 있다.

이번 작업은 frontend 상태 관리와 화면 연동을 고도화하는 범위다. 새로운 Spring Boot API, Next.js BFF, 공공데이터 OpenAPI 호출은 추가하지 않는다.

## 사용자 시나리오

1. `/stores`에서 키워드, 지역, 업종 조건으로 점포를 검색한다.
2. 검색 조건은 URL query parameter에 반영되므로 새로고침하거나 링크를 공유해도 같은 조건이 복원된다.
3. `지도에서 보기`를 누르면 현재 조건을 유지한 채 `/map`으로 이동한다.
4. `/map`에서 지도 marker 또는 점포 목록 item을 선택하면 marker, 목록 highlight, 상세 패널이 함께 갱신된다.
5. 관심 지역 또는 점포를 후보 바구니에 추가한다.
6. 후보 2개를 선택해 `/compare`로 이동하면 기준 지역과 비교 지역이 query parameter로 전달된다.

## URL Query 상태 관리 방식

공통 query parameter는 `apps/web/src/features/explore/lib/explore-query-schema.ts`에서 Zod로 검증한다.

주요 parameter:

- `keyword`
- `ctprvnCd`, `ctprvnNm`
- `signguCd`, `signguNm`
- `adongCd`, `adongNm`
- `indsLclsCd`, `indsLclsNm`
- `indsMclsCd`, `indsMclsNm`
- `indsSclsCd`, `indsSclsNm`
- `page`, `size`
- `lat`, `lng`, `radius`, `zoom`

코드 값은 API 요청과 select value에 우선 사용하고, 명칭 값은 UI 복원과 기존 name 기반 API fallback을 위해 함께 보관한다. 잘못된 page, size, radius 값은 기본값으로 보정한다. query에는 token, cookie, service key 같은 민감 정보를 넣지 않는다.

`useExploreUrlState`는 Next.js `useSearchParams`, `useRouter`, `URLSearchParams`를 사용한다. 빠른 연속 필터 변경에서도 이전 조건이 덮어써지지 않도록 최신 query ref를 유지한다.

## 지도-목록 연동 방식

`/map`은 URL에서 지역, 업종, 좌표, 반경을 복원한다. 지도 중심이나 bounds가 움직이면 즉시 API를 다시 호출하지 않고 `현재 지도 영역에서 검색` 버튼을 보여준다. 사용자가 버튼을 누른 시점에만 현재 viewport 조건으로 marker 조회를 갱신한다.

연동 규칙:

- marker 클릭: 선택 marker 갱신, 점포 목록 highlight, 상세 패널 열기
- 목록 item 클릭: 지도 중심 이동, marker 선택, 상세 패널 열기
- 상세 패널과 목록 양쪽에서 `후보에 추가` 가능
- 반경 검색 결과는 거리순 목록으로 별도 표시

지도 정보만으로 의미가 전달되지 않도록 동일한 점포 정보를 목록과 상세 패널에서도 제공한다.

## 후보 바구니 LocalStorage 구조

후보 바구니 저장 key:

```text
localbiz-radar:candidate-tray
```

후보는 최대 6개까지 저장한다. 같은 지역 또는 같은 점포 id는 중복 저장하지 않고 최신 추가 시점의 항목으로 갱신한다.

지역 후보 예시:

```json
{
  "type": "REGION",
  "id": "region:11:11680:11680640",
  "ctprvnCd": "11",
  "ctprvnNm": "서울특별시",
  "signguCd": "11680",
  "signguNm": "강남구",
  "adongCd": "11680640",
  "adongNm": "역삼1동",
  "source": "STORES",
  "addedAt": "2026-05-28T00:00:00.000Z"
}
```

점포 후보 예시:

```json
{
  "type": "STORE",
  "id": "store:1",
  "storeId": 1,
  "storeName": "역삼 모닝커피",
  "categoryName": "커피전문점",
  "ctprvnCd": "11",
  "ctprvnNm": "서울특별시",
  "signguCd": "11680",
  "signguNm": "강남구",
  "adongCd": "11680640",
  "adongNm": "역삼1동",
  "latitude": 37.499,
  "longitude": 127.032,
  "addedAt": "2026-05-28T00:00:00.000Z"
}
```

후보 2개를 선택하면 `/compare`로 이동하는 URL을 만든다. 신규 query key인 `baseCtprvnCd`, `targetSignguCd`와 기존 compare 호환 key인 `baseSido`, `targetSigungu`를 함께 포함해 기존 비교 화면 복원 로직을 깨뜨리지 않는다.

## 최근 탐색 조건 구조

최근 탐색 조건 저장 key:

```text
localbiz-radar:recent-explore-searches
```

저장 대상:

- `/stores` 검색 실행
- `/map` 지도 영역 검색 실행
- `/map` 반경 검색 실행

저장 데이터:

```json
{
  "id": "stores-key",
  "label": "점포 목록: 커피",
  "path": "/stores",
  "query": "keyword=%EC%BB%A4%ED%94%BC&ctprvnCd=11",
  "createdAt": "2026-05-28T00:00:00.000Z"
}
```

최근 5개까지만 보관하고 같은 `path + query`는 중복 저장하지 않는다. 검색어는 화면 표시용으로 길이를 제한하며 민감 정보 key는 저장하지 않는다.

## Sentry Breadcrumb 정책

다음 액션은 Sentry breadcrumb로 남긴다.

- `/stores` 검색 실행
- `/stores` 필터 초기화
- `/stores` 지도에서 보기 클릭
- `/map` marker 클릭
- `/map` 목록 item 클릭
- `/map` 반경 검색 실행
- 후보 바구니 추가/삭제
- `/compare` 후보 바구니에서 비교 실행

breadcrumb에는 검색어 원문을 남기지 않고 `hasKeyword`, `keywordLength`, region/category code 수준의 정보만 남긴다. 인증 cookie, access/refresh token, 공공데이터 service key는 포함하지 않는다.

## 접근성 고려사항

- select와 input은 label을 연결한다.
- 후보 바구니 조작 버튼은 명확한 텍스트와 keyboard focus를 제공한다.
- 지도 marker 정보는 목록과 상세 패널에서도 확인할 수 있다.
- Active filter chip은 어떤 조건을 제거하는지 screen reader가 이해할 수 있는 텍스트를 가진다.
- `현재 지도 영역에서 검색`은 명확한 텍스트 버튼으로 제공한다.
- 후보 2개 미만일 때 비교 버튼은 disabled 상태와 사유를 함께 표시한다.

## 테스트 방법

단위 테스트:

```bash
pnpm --filter web test:run -- src/features/explore
```

E2E 테스트:

```bash
pnpm --filter web e2e -- e2e/explore-flow.spec.ts
```

Storybook:

```bash
pnpm build-storybook:web
```

수동 확인:

1. `pnpm dev:web`으로 frontend를 실행한다.
2. `/stores`에서 키워드, 지역, 업종을 선택한다.
3. URL에 query가 반영되는지 확인한다.
4. 새로고침 후 필터가 복원되는지 확인한다.
5. `지도에서 보기`로 이동해 `/map` query가 유지되는지 확인한다.
6. 지도 목록 item을 눌러 상세 패널이 열리는지 확인한다.
7. 후보 2개를 선택해 `/compare`로 이동하는지 확인한다.

## 현재 한계

- 후보 바구니와 최근 탐색 조건은 브라우저 localStorage에만 저장한다.
- 로그인 사용자별 후보 저장이나 서버 동기화는 아직 없다.
- 지도 marker clustering과 행정동 polygon은 아직 없다.
- 지도 초기 데이터는 기존 Store/Map API 응답 범위에 의존한다.
- 공유 링크 미리보기 metadata는 아직 제공하지 않는다.

## 향후 개선 계획

- 서버 저장형 즐겨찾기
- 로그인 사용자별 후보 저장
- 지도 clustering 고도화
- 상권 영역 polygon 표시
- 공유 링크 미리보기
- Next.js server-side 초기 데이터 prefetch
