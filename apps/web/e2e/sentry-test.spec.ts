import { expect, test } from "@playwright/test";

test("renders local Sentry test page controls", async ({ page }) => {
  await page.goto("/sentry-test");

  await expect(
    page.getByRole("heading", { name: "Sentry 테스트", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "클라이언트 에러 발생" })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "수동 captureException 테스트" }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "breadcrumb 테스트" })).toBeVisible();
});
