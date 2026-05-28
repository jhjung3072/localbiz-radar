import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("keeps filters in URL and carries candidates to compare", async ({ page }) => {
  await page.goto("/stores");

  await page.getByLabel("키워드로 점포 검색").fill("커피");
  await page.getByRole("button", { name: "검색" }).click();
  await page.locator("#store-sido").selectOption("11");
  await page.locator("#store-sigungu").selectOption("11680");
  await page.locator("#store-dong").selectOption("11680640");
  await page.locator("#store-category-large").selectOption("I2");

  await expect(page).toHaveURL(/keyword=/);
  await expect(page).toHaveURL(/ctprvnCd=11/);
  await expect(page).toHaveURL(/signguCd=11680/);
  await expect(page).toHaveURL(/indsLclsCd=I2/);

  await page.reload();
  await expect(page.getByLabel("키워드로 점포 검색")).toHaveValue("커피");
  await expect(page.locator("#store-sigungu")).toHaveValue("11680");

  await page.getByRole("button", { name: "현재 지역 후보 추가" }).click();
  await page.getByRole("button", { name: /^추가$/ }).first().click();
  await expect(page.getByRole("heading", { name: "후보 바구니" })).toBeVisible();

  await page.getByRole("link", { name: "지도에서 보기" }).click();
  await expect(page).toHaveURL(/\/map/);
  await expect(page).toHaveURL(/ctprvnCd=11/);

  await page.getByRole("button", { name: "현재 지역 후보 추가" }).click();
  const mapStoreList = page.getByRole("region", { name: "지도 점포 목록" });
  await mapStoreList.getByRole("button", { name: /역삼 모닝커피/ }).click();
  await expect(page.getByRole("heading", { name: "역삼 모닝커피" })).toBeVisible();
  await page
    .getByLabel("선택한 점포 상세")
    .getByRole("button", { name: "후보에 추가" })
    .click();

  await page.getByRole("button", { name: "비교 후보 선택" }).first().click();
  await page.getByRole("button", { name: "비교 후보 선택" }).first().click();
  await page.getByRole("link", { name: "선택 후보로 비교하기" }).click();

  await expect(page).toHaveURL(/\/compare/);
  await expect(page).toHaveURL(/baseCtprvnCd=11/);
  await expect(page.getByRole("heading", { name: "후보 지역 비교" })).toBeVisible();

  const tokenStorage = await page.evaluate(() => ({
    local: Object.keys(window.localStorage).filter((key) =>
      key.toLowerCase().includes("token"),
    ),
    session: Object.keys(window.sessionStorage).filter((key) =>
      key.toLowerCase().includes("token"),
    ),
  }));
  expect(tokenStorage.local).toEqual([]);
  expect(tokenStorage.session).toEqual([]);
});
