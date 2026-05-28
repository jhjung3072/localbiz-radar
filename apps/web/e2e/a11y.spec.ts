import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { mockApi } from "./helpers/api-mocks";

test.beforeEach(async ({ page }) => {
  await mockApi(page);
});

for (const path of ["/", "/stores", "/compare", "/admin/login"]) {
  test(`has no critical or serious accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const highImpactViolations = results.violations.filter((violation) =>
      ["critical", "serious"].includes(violation.impact ?? ""),
    );

    expect(highImpactViolations).toEqual([]);
  });
}
