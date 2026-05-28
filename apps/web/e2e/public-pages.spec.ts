import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test.describe("public pages", () => {
  const pages = [
    { path: "/", heading: "LocalBiz Radar" },
    { path: "/dashboard", heading: "상권 대시보드" },
    { path: "/stores", heading: "점포 목록" },
    { path: "/analysis", heading: "상권 분석" },
    { path: "/compare", heading: "후보 지역 비교" },
    { path: "/map", heading: "지도 기반 점포 분포" },
  ];

  for (const pageInfo of pages) {
    test(`${pageInfo.path} renders without login`, async ({ page }) => {
      await page.goto(pageInfo.path);

      await expect(
        page.getByRole("heading", { name: pageInfo.heading, level: 1 }),
      ).toBeVisible();
      await expect(page).not.toHaveURL(/\/admin\/login/);
    });
  }
});
