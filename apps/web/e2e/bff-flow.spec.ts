import { expect, test } from "@playwright/test";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

test("renders BFF-backed pages and protects admin BFF routes", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.getByRole("heading", { name: "지역 상권 대시보드" })).toBeVisible();
  await expect(page.getByText("총 점포 수")).toBeVisible();

  await page.goto("/stores");
  await expect(page.getByRole("heading", { name: "점포 목록" })).toBeVisible();
  await expect(page.getByRole("cell", { name: "역삼 모닝커피" })).toBeVisible();

  await page.goto("/compare");
  await expect(page.getByRole("heading", { name: "후보 지역 비교" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "추천 후보 지역" })).toBeVisible();

  const unauthorized = await page.request.get("/bff/admin/ops");
  expect(unauthorized.status()).toBe(401);

  await page.goto("/admin/login?next=/admin/ops");
  await page.getByLabel("아이디").fill("admin");
  await page.getByLabel("비밀번호").fill("admin1234");
  await page.getByRole("button", { name: "로그인" }).click();

  await expect(page).toHaveURL(/\/admin\/ops$/);
  await expect(page.getByRole("heading", { name: "운영 대시보드" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "서비스 상태" })).toBeVisible();

  await page.goto("/data-sync");
  await expect(
    page.getByRole("heading", { name: "데이터 동기화", exact: true }),
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "동기화 이력" })).toBeVisible();

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
