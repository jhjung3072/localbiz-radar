import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("compares base and target regions with cascading selects", async ({ page }) => {
  await page.goto("/compare");

  await expect(page.getByRole("heading", { name: "후보 지역 비교" })).toBeVisible();

  await page.locator("#base-sido").selectOption("11");
  await page.locator("#base-sigungu").selectOption("11680");
  await page.locator("#base-dong").selectOption("11680640");
  await page.locator("#target-sido").selectOption("11");
  await page.locator("#target-sigungu").selectOption("11440");
  await page.locator("#target-dong").selectOption("11440660");
  await page.locator("#compare-large").selectOption("I2");
  await page.locator("#compare-medium").selectOption("I212");

  await page.getByRole("button", { name: "비교하기" }).click();

  await expect(
    page.getByRole("heading", { name: "서울특별시 마포구 서교동" }).first(),
  ).toBeVisible();
  await expect(page.getByText("추천 지역")).toBeVisible();
  await expect(page.getByText("지표 비교")).toBeVisible();
  await expect(page.getByText("지역 랭킹")).toBeVisible();
});
