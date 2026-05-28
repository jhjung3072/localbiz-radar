import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("protects admin ops page and renders operations dashboard after login", async ({ page }) => {
  await page.goto("/admin/ops");

  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fadmin%2Fops/);
  await page.getByLabel("아이디").fill("admin");
  await page.getByLabel("비밀번호").fill("admin1234");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/admin\/ops$/);
  await expect(
    page.getByRole("heading", { name: "운영 대시보드", level: 1 }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "서비스 상태" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "데이터 품질" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sentry 상태" })).toBeVisible();
});
