import { test, expect } from "@playwright/test";

test.describe("Authentication flows", () => {
  test("redirects unauthenticated users from dashboard to sign-in", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("redirects unauthenticated users from simulations to sign-in", async ({
    page,
  }) => {
    await page.goto("/simulations");
    await expect(page).toHaveURL(/sign-in/);
  });

  test("sign-in page loads", async ({ page }) => {
    await page.goto("/sign-in");
    await page.waitForLoadState("networkidle");
    // Clerk renders its sign-in component
    expect(page.url()).toContain("sign-in");
  });
});
