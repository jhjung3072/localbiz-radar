import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "clipboard", {
      value: {
        writeText: async () => undefined,
      },
      configurable: true,
    });
  });
  await mockApi(page);
});

test("opens a shareable compare report from compare page", async ({ page }) => {
  await page.goto("/compare");

  await expect(page.getByRole("heading", { name: "후보 지역 비교" })).toBeVisible();
  await expect(page.getByRole("link", { name: /리포트로 보기/ })).toBeVisible();

  await page.getByRole("link", { name: /리포트로 보기/ }).click();

  await expect(page).toHaveURL(/\/reports\/compare/);
  await expect(
    page.getByRole("heading", { name: /상권 비교 리포트/ }),
  ).toBeVisible();
  await expect(page.getByText("기준 지역", { exact: true })).toBeVisible();
  await expect(page.getByText("비교 지역", { exact: true })).toBeVisible();
  await expect(page.getByText("추천 지역", { exact: true }).first()).toBeVisible();

  await page.getByRole("button", { name: "공유 링크 복사" }).click();
  await expect(page.getByText("공유 링크를 복사했습니다.")).toBeVisible();
  await expect(page.getByRole("button", { name: "인쇄하기" })).toBeVisible();

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

test("shows an error state for invalid report query", async ({ page }) => {
  await page.goto("/reports/compare?baseCtprvnCd=11");

  await expect(
    page.getByRole("heading", { name: "리포트 조건이 올바르지 않습니다" }),
  ).toBeVisible();
});
