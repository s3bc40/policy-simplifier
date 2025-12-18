import { test, expect } from "@playwright/test";

test.describe("Authentication Flow", () => {
  test("should show login page for unauthenticated users", async ({ page }) => {
    await page.goto("/summarize");
    await expect(page).toHaveURL("/auth/login?redirect=%2Fsummarize");
  });

  test("should show landing page without auth", async ({ page }) => {
    await page.goto("/");
    // Check for hero section heading
    await expect(page.locator("h1").first()).toContainText(
      "Turn Complex Policies"
    );
  });

  test("should display login form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('button[type="submit"]')).toContainText(
      "Sign In"
    );
  });

  test("should display signup form", async ({ page }) => {
    await page.goto("/auth/signup");
    // Check for signup form elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator("input#password")).toBeVisible();
  });

  test("should have OAuth buttons on login page", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
  });

  test("should have OAuth buttons on signup page", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page.locator('button:has-text("GitHub")')).toBeVisible();
    await expect(page.locator('button:has-text("Google")')).toBeVisible();
  });
});
