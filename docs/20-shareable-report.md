# 공유 가능한 상권 비교 리포트

## 기능 개요

공유 리포트는 `/compare`에서 만든 후보 지역 A/B 비교 결과를 URL만으로 다시 열 수 있는 페이지다. 사용자는 `/reports/compare?...` 링크를 복사해 다른 사람에게 전달하거나 브라우저 인쇄 기능으로 PDF 저장을 할 수 있다.

이번 기능은 Next.js App Router의 Server Component, Route Handler BFF, Dynamic Metadata, Open Graph Image를 사용한다. Spring Boot는 기존 Analysis API 계산을 그대로 담당하고, Next.js는 화면 단위 데이터 조립과 공유 페이지 렌더링만 담당한다.

## 사용자 시나리오

1. `/compare`에서 기준 지역, 비교 지역, 관심 업종을 선택한다.
2. 비교 결과가 표시되면 `리포트로 보기`를 누른다.
3. `/reports/compare` 페이지가 URL query로 조건을 복원한다.
4. 리포트에서 추천 지역, 추천 사유, 핵심 지표, 지역 랭킹을 확인한다.
5. `공유 링크 복사` 또는 `인쇄하기`를 사용한다.

## 왜 Next.js가 적합한가

React SPA만 사용하면 공유 링크의 metadata와 Open Graph 미리보기 이미지를 서버에서 동적으로 만들기 어렵다. 이 기능은 Next.js Server Component가 초기 HTML에 리포트 내용을 포함하고, `generateMetadata`와 `opengraph-image.tsx`가 공유 미리보기 정보를 서버에서 생성한다.

## BFF route 구조

추가 route:

- `GET /bff/reports/compare`

역할:

- URL query를 검증한다.
- master data로 지역/업종 label을 복원한다.
- Spring Boot `POST /api/analysis/compare`를 호출한다.
- `GET /api/analysis/region-ranking`을 함께 호출한다.
- 리포트 전용 ViewModel로 조합한다.

Spring Boot 호출:

- `POST /api/analysis/compare`
- `GET /api/analysis/region-ranking`
- `GET /api/master/regions`
- `GET /api/master/categories`

비즈니스 점수 계산은 BFF에서 하지 않는다. LocalBiz 점수, 경쟁 강도, 업종 다양성, 점포 밀도는 Spring Boot Analysis API 결과를 사용한다.

## Server Component 데이터 로딩

`/reports/compare/page.tsx`는 Server Component로 동작한다. 서버에서 `getCompareReport()`를 호출해 초기 데이터를 가져오고 `CompareReportView`에 전달한다.

개발 중 Spring Boot가 꺼져 있는 경우를 위해 클라이언트 fallback loader도 둔다. 실제 운영 흐름에서는 Spring Boot API가 살아 있어야 서버 렌더링된 리포트가 제공된다.

## Dynamic Metadata

`generateMetadata`는 리포트 데이터를 기반으로 title, description, Open Graph, Twitter card 정보를 만든다.

예시:

- title: `강남구 vs 마포구 음식점 상권 비교 리포트 | LocalBiz Radar`
- description: `음식점 기준으로 점포 수, 경쟁 강도, 업종 다양성, LocalBiz 점수를 비교한 리포트입니다.`

조건이 잘못됐거나 API 호출이 실패하면 generic metadata를 반환해 페이지 자체가 깨지지 않게 한다.

## Open Graph Image

`/reports/compare/opengraph-image.tsx`는 Next.js `ImageResponse`를 사용한다.

표시 정보:

- LocalBiz Radar
- 기준 지역
- 비교 지역
- 추천 지역
- LocalBiz score 요약

외부 font 파일은 커밋하지 않는다. 한국어 렌더링은 시스템 폰트 fallback을 사용한다.

## URL query 설계

주요 query parameter:

- `baseCtprvnCd`
- `baseSignguCd`
- `baseAdongCd`
- `targetCtprvnCd`
- `targetSignguCd`
- `targetAdongCd`
- `indsLclsCd`
- `indsMclsCd`
- `indsSclsCd`

name parameter는 optional이다. name이 없으면 BFF가 master data에서 label을 복원한다.

예시:

```text
/reports/compare?baseCtprvnCd=11&baseSignguCd=11680&targetCtprvnCd=11&targetSignguCd=11440&indsLclsCd=I2
```

## Print layout 전략

PDF 파일을 서버에서 생성하지 않는다. 브라우저의 인쇄 기능을 사용한다.

print CSS 정책:

- 일반 navigation과 리포트 action 버튼을 숨긴다.
- A4 기준 여백을 설정한다.
- 배경색 없이도 표와 카드의 정보가 보이게 한다.
- 핵심 지표는 차트가 아니라 표로도 제공한다.

## Sentry breadcrumb 정책

리포트 진입, 서버 렌더링 성공, BFF upstream 실패, 공유 링크 복사, 인쇄 실행을 breadcrumb 또는 exception으로 남긴다.

Sentry에 포함하지 않는 값:

- 인증 cookie
- JWT token
- 공공데이터 service key
- `SENTRY_AUTH_TOKEN`
- `Set-Cookie`
- query 전체 원문

breadcrumb에는 지역 코드와 업종 코드 정도만 남긴다.

## 테스트 방법

```bash
pnpm --filter web test:run
pnpm --filter web e2e -- e2e/report-flow.spec.ts
pnpm --filter web build
pnpm build-storybook:web
```

수동 확인:

1. `/compare`에서 비교 결과를 만든다.
2. `리포트로 보기`를 누른다.
3. `/reports/compare`에서 제목, 기준 지역, 비교 지역, 추천 지역을 확인한다.
4. 공유 링크 복사와 인쇄 버튼을 확인한다.
5. 브라우저 공유 미리보기 또는 metadata를 확인한다.

## 현재 한계

- 리포트 snapshot은 DB에 저장하지 않는다.
- URL query가 현재 데이터에 대해 다시 계산되므로, 데이터 동기화 이후 결과가 달라질 수 있다.
- PDF 서버 생성 기능은 없다.
- 공유 링크 만료, 권한 제어, 리포트 템플릿 선택 기능은 없다.

## 향후 개선 계획

- 서버 저장형 report snapshot
- PDF 서버 생성
- 리포트 공유 만료 링크
- 리포트 템플릿 선택
- public OG image 디자인 고도화
- 유동인구/매출 데이터 반영
