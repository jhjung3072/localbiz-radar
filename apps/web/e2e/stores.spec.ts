import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("shows store search filters and result table", async ({ page }) => {
  await page.goto("/stores");

  await expect(page.getByRole("heading", { name: "점포 목록" })).toBeVisible();
  await expect(page.getByLabel("키워드로 점포 검색")).toBeVisible();
  await page.getByLabel("키워드로 점포 검색").fill("커피");

  await expect(page.getByRole("table", { name: /점포 목록/ })).toBeVisible();
  await expect(page.getByRole("cell", { name: "역삼 모닝커피" })).toBeVisible();
  await expect(page.getByText(/총 1개 중/)).toBeVisible();
});
