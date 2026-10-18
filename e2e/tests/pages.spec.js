import { expect, test } from "@playwright/test";
import { addToCart, demoCustomer, logIn, uniqueCustomer, API_URL } from "./helpers.js";

test("footer links open the content pages", async ({ page }) => {
  const pages = [
    ["About Us", "Clothing for everyday life"],
    ["FAQs", "Frequently Asked Questions"],
    ["Shipping & Returns", "Shipping & Returns"],
    ["Privacy Policy", "Privacy Policy"],
    ["Terms of Use", "Terms of Use"],
  ];
  for (const [link, heading] of pages) {
    await page.goto("/");
    await page.getByRole("contentinfo").getByRole("link", { name: link }).click();
    await expect(page.getByRole("heading", { level: 1, name: heading })).toBeVisible();
  }
});

test("a visitor sends a message and the admin reads it", async ({ page }) => {
  await page.goto("/contact");
  await page.getByLabel("Name", { exact: true }).fill("Asha Rao");
  await page.getByLabel("Email", { exact: true }).fill("asha@example.com");
  await page.getByLabel("Subject").fill("Playwright message");
  await page.getByLabel("Message", { exact: true }).fill("Do you deliver to Shillong?");
  await page.getByRole("button", { name: "Send Message" }).click();
  await expect(page.getByText("your message has been sent")).toBeVisible();

  await logIn(page, { email: "admin@poscon.dev", password: "admin1234" });
  await page.goto("/admin/messages");
  await page.getByRole("button", { name: /Playwright message/ }).click();
  await expect(page.getByText("Do you deliver to Shillong?")).toBeVisible();
});

test("a customer saves their address and it fills in checkout", async ({ page, request }) => {
  const customer = uniqueCustomer();
  await request.post(`${API_URL}/signup/user`, { data: customer });
  await logIn(page, customer);

  await page.goto("/profile");
  await page.getByLabel("Full name").fill("Ravi Kumar");
  await page.getByLabel("Address").fill("8 Anna Salai");
  await page.getByLabel("City").fill("Chennai");
  await page.getByLabel("Pincode").fill("600002");
  await page.getByRole("button", { name: "Save Changes" }).click();
  await expect(page.getByText("Your details have been saved.")).toBeVisible();

  await addToCart(page, 14);
  await page.getByRole("button", { name: "Checkout" }).click();
  await expect(page.getByPlaceholder("City")).toHaveValue("Chennai");
  await expect(page.getByPlaceholder("Pincode")).toHaveValue("600002");
  await page.reload();
  await expect(page).toHaveURL(/\/checkout$/);
});

test.describe("on a phone", () => {
  test.use({ viewport: { width: 375, height: 812 }, isMobile: true, hasTouch: true });

  test("pages fit the screen and the menu works", async ({ page }) => {
    for (const path of ["/", "/browseproduct", "/product/3", "/about", "/contact", "/faqs"]) {
      await page.goto(path);
      await page.waitForLoadState("networkidle");
      const width = await page.evaluate(() => document.documentElement.scrollWidth);
      expect({ path, width }).toEqual({ path, width: 375 });
    }

    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("link", { name: "About" }).click();
    await expect(page.getByRole("heading", { level: 1, name: "Clothing for everyday life" })).toBeVisible();
  });

  test("filters open from a button", async ({ page }) => {
    await page.goto("/browseproduct");
    await expect(page.getByRole("heading", { name: "Category" })).toBeHidden();
    await page.getByRole("button", { name: "Filters" }).click();
    await page.getByRole("button", { name: /^accessories/ }).click();
    await expect(page).toHaveURL(/category=accessories/);
  });

  test("a logged-in shopper reaches checkout", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.getByRole("navigation", { name: "Mobile" }).getByRole("button", { name: "Log in" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Email").fill(demoCustomer.email);
    await dialog.getByPlaceholder("Password").fill(demoCustomer.password);
    await dialog.getByRole("button", { name: "Log In" }).click();
    await expect(dialog).toBeHidden();

    await addToCart(page, 3, { size: "S" });
    await expect(page.getByText("Size S")).toBeVisible();
    await page.getByRole("button", { name: "Checkout" }).click();
    await expect(page.getByRole("heading", { name: "Delivery Address" })).toBeVisible();
  });
});
