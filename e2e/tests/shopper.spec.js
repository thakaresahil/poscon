import { expect, test } from "@playwright/test";
import { addToCart, fillShipping, payByCard, uniqueCustomer } from "./helpers.js";

test("a new shopper signs up, buys two items and sees the order", async ({ page }) => {
  const shopper = uniqueCustomer();

  await test.step("sign up and log in", async () => {
    await page.goto("/");
    await page.getByRole("button", { name: "Log In" }).first().click();
    await page.getByRole("button", { name: "Create an account" }).click();
    const dialog = page.getByRole("dialog");
    await dialog.getByPlaceholder("Email").fill(shopper.email);
    await dialog.getByPlaceholder("Phone Number").fill(shopper.pnum);
    await dialog.getByPlaceholder("Password", { exact: true }).fill(shopper.password);
    await dialog.getByPlaceholder("Confirm Password").fill(shopper.password);
    await dialog.getByRole("button", { name: "Create Account" }).click();

    await expect(dialog.getByRole("heading", { name: "Log In" })).toBeVisible();
    await dialog.getByPlaceholder("Email").fill(shopper.email);
    await dialog.getByPlaceholder("Password").fill(shopper.password);
    await dialog.getByRole("button", { name: "Log In" }).click();
    await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
  });

  await test.step("search and add products to the cart", async () => {
    await page.getByRole("searchbox", { name: "Search products" }).fill("linen");
    await page.getByRole("searchbox", { name: "Search products" }).press("Enter");
    await expect(page.getByRole("heading", { name: 'Results for "linen"' })).toBeVisible();
    await page.getByRole("link", { name: /Linen Blend Casual Shirt/ }).click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await expect(page.getByText("Please choose a size.")).toBeVisible();
    await page.getByRole("button", { name: "L", exact: true }).click();
    await page.getByRole("button", { name: "Add to Cart" }).click();
    await page.getByRole("status").getByRole("link", { name: "View cart" }).click();
    await expect(page).toHaveURL(/\/cart$/);
    await expect(page.getByText("Size L")).toBeVisible();

    await addToCart(page, 5);
    await page.getByRole("button", { name: /Increase quantity of Linen/ }).click();
    await expect(page.getByRole("heading", { name: "Your Cart (3 items)" })).toBeVisible();
    await expect(page.getByRole("complementary").getByText("₹2997").last()).toBeVisible();
    await expect(page.getByLabel("3 items in cart").first()).toBeVisible();
  });

  await test.step("check out and recover from a declined card", async () => {
    await page.getByRole("button", { name: "Checkout" }).click();
    await fillShipping(page);
    await page.getByRole("button", { name: "Continue to Payment (₹2997)" }).click();
    await expect(page.getByText("Demo mode: no real payment is taken.")).toBeVisible();

    await payByCard(page, "4000 0000 0000 0002");
    await expect(page.getByText("Your card was declined by the bank")).toBeVisible();

    await page.getByPlaceholder("Card Number").fill("4242 4242 4242 4242");
    await page.getByRole("button", { name: "Pay ₹2997" }).click();
    await expect(page.getByText("Payment successful, your order has been placed!")).toBeVisible();
    await expect(page.getByText("Visa ending in 4242")).toBeVisible();
  });

  await test.step("see the order in order history", async () => {
    await page.getByRole("link", { name: "My Orders" }).first().click();
    const order = page.getByRole("link", { name: /Order #\d+/ }).first();
    await expect(order).toContainText("3 items");
    await expect(order).toContainText("₹2997");
    await expect(page.getByLabel(/items in cart/)).toHaveCount(0);
  });
});

test("filters, sorting and pages are kept in the URL", async ({ page }) => {
  await page.goto("/browseproduct");
  await page.getByRole("button", { name: "Women" }).click();
  await page.getByRole("combobox").selectOption("price_asc");
  await expect(page).toHaveURL(/gender=women/);
  await expect(page).toHaveURL(/sort=price_asc/);

  const prices = await page.locator("a[href^='/product/'] .price").allInnerTexts();
  const values = prices.map((text) => Number(text.replace(/\D/g, "")));
  expect(values).toEqual([...values].sort((a, b) => a - b));

  await page.reload();
  await expect(page.getByRole("combobox")).toHaveValue("price_asc");
});
