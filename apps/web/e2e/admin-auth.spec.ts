import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("protects data sync page with admin login", async ({ page }) => {
  await page.goto("/data-sync");

  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fdata-sync/);
  await expect(page.getByRole("heading", { name: "관리자 로그인" })).toBeVisible();

  await page.getByLabel("아이디").fill("admin");
  await page.getByLabel("비밀번호").fill("wrong-password");
  await page.getByRole("button", { name: "로그인" }).click();
  await expect(page.getByText("아이디 또는 비밀번호가 올바르지 않습니다.")).toBeVisible();

  await page.getByLabel("비밀번호").fill("admin1234");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/data-sync$/);
  await expect(
    page.getByRole("heading", { name: "데이터 동기화", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "동기화 이력" })).toBeVisible();

  const tokenStorage = await page.evaluate(() => ({
    local: Object.keys(window.localStorage).filter((key) => key.toLowerCase().includes("token")),
    session: Object.keys(window.sessionStorage).filter((key) => key.toLowerCase().includes("token")),
  }));
  expect(tokenStorage.local).toEqual([]);
  expect(tokenStorage.session).toEqual([]);

  await page.getByRole("button", { name: "로그아웃" }).click();
  await expect(page).toHaveURL(/\/admin\/login\?next=%2Fdata-sync/);
});
