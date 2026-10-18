import { expect, test } from "@playwright/test";
import { demoCustomer, logIn } from "./helpers.js";

test("protected pages ask a logged-out visitor to log in", async ({ page }) => {
  for (const path of ["/cart", "/orders", "/checkout", "/profile"]) {
    await page.goto(path);
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole("dialog").getByRole("heading", { name: "Log In" })).toBeVisible();
  }
});

test("customers cannot see the admin area", async ({ page }) => {
  await logIn(page, demoCustomer);
  await expect(page.getByRole("link", { name: "Admin", exact: true })).toHaveCount(0);
  await page.goto("/admin");
  await expect(page.getByText("Sorry, we couldn't find that page.")).toBeVisible();
});

test("an expired session logs the user out", async ({ page }) => {
  await logIn(page, demoCustomer);
  await page.evaluate(() => localStorage.setItem("token", "expired.token.value"));
  await page.goto("/orders");
  await expect(page.getByRole("dialog").getByRole("heading", { name: "Log In" })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("token"))).toBeNull();
});

test("unknown pages show the 404 page", async ({ page }) => {
  await page.goto("/no-such-page");
  await expect(page.getByRole("heading", { name: "404" })).toBeVisible();
});
