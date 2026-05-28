import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("keeps large exploration UX stable with debounce and virtualized lists", async ({ page }) => {
  await page.goto("/stores");
  await expect(page.getByRole("heading", { name: "점포 목록" })).toBeVisible();
  await page.waitForLoadState("networkidle");

  const keywordInput = page.getByLabel("키워드로 점포 검색");
  await keywordInput.fill("ㅋ");
  await keywordInput.fill("커");
  await keywordInput.fill("커피");

  await expect(page).toHaveURL(/keyword=/);
  await expect(keywordInput).toHaveValue("커피");
  await expect(page.getByRole("cell", { name: "역삼 모닝커피" })).toBeVisible();

  await page.locator("#store-sido").selectOption("11");
  await page.locator("#store-sigungu").selectOption("11680");
  await page.getByRole("button", { name: /검색어: 커피 필터 제거/ }).click();
  await expect(page).not.toHaveURL(/keyword=/);
  await expect(page).toHaveURL(/signguCd=11680/);

  await page.getByRole("link", { name: "지도에서 보기" }).click();
  await expect(page).toHaveURL(/\/map/);
  await expect(page.getByLabel("마커 클러스터링 사용")).toBeVisible();

  await page.getByLabel("마커 클러스터링 사용").uncheck();
  await expect(page.getByLabel("마커 클러스터링 사용")).not.toBeChecked();

  const mapStoreList = page.getByRole("region", { name: "지도 점포 목록" });
  await mapStoreList.getByRole("button", { name: /역삼 모닝커피/ }).click();
  await expect(page.getByRole("heading", { name: "역삼 모닝커피" })).toBeVisible();

  const viewportSearchButton = page.getByRole("button", {
    name: /현재 지도 영역에서 검색|지도 영역 조회 중/,
  });
  if ((await viewportSearchButton.count()) > 0) {
    await viewportSearchButton.click();
  }

  await page
    .getByLabel("선택한 점포 상세")
    .getByRole("button", { name: "후보에 추가" })
    .click();
  await page.getByRole("button", { name: "현재 지역 후보 추가" }).click();
  await page.getByRole("button", { name: "비교 후보 선택" }).first().click();
  await page.getByRole("button", { name: "비교 후보 선택" }).first().click();
  await page.getByRole("link", { name: "선택 후보로 비교하기" }).click();

  await expect(page).toHaveURL(/\/compare/);
  await expect(page.getByRole("heading", { name: "후보 지역 비교" })).toBeVisible();
});
