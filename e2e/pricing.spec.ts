import { test, expect } from "@playwright/test";

test.describe("Pricing page", () => {
  test("loads and shows all tiers", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=Free")).toBeVisible();
    await expect(page.locator("text=Pro")).toBeVisible();
    await expect(page.locator("text=Enterprise")).toBeVisible();
  });

  test("shows correct Pro price", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=$79")).toBeVisible();
  });

  test("shows enterprise pilot section", async ({ page }) => {
    await page.goto("/pricing");
    await expect(page.locator("text=Enterprise Pilot Program")).toBeVisible();
  });
});
