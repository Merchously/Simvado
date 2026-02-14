import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("pricing page is accessible from landing", async ({ page }) => {
    await page.goto("/");
    await page.click("text=Pricing");
    await expect(page).toHaveURL(/pricing/);
  });

  test("sign-up link exists", async ({ page }) => {
    await page.goto("/");
    const link = page.locator("a[href='/sign-up']").first();
    await expect(link).toBeVisible();
  });
});
