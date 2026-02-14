import { test, expect } from "@playwright/test";

test.describe("Landing page", () => {
  test("loads and displays hero section", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("h1")).toContainText("Leadership Training");
    await expect(page.locator("h1")).toContainText("Evolved");
  });

  test("has navigation links", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Features")).toBeVisible();
    await expect(page.locator("text=Pricing")).toBeVisible();
  });

  test("has call-to-action buttons", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("text=Request Early Access")).toBeVisible();
  });
});
