import { expect } from "@playwright/test";

export const API_URL = "http://localhost:9100";

export const demoCustomer = { email: "demo@poscon.dev", password: "demo1234" };
export const demoAdmin = { email: "admin@poscon.dev", password: "admin1234" };

export const uniqueCustomer = () => {
  const unique = `${Date.now()}`.slice(-9);
  return { email: `shopper${unique}@test.dev`, pnum: `8${unique}`, password: "password123" };
};

export async function logIn(page, { email, password }) {
  await page.goto("/");
  await page.getByRole("button", { name: "Log In" }).first().click();
  const dialog = page.getByRole("dialog");
  await dialog.getByPlaceholder("Email").fill(email);
  await dialog.getByPlaceholder("Password").fill(password);
  await dialog.getByRole("button", { name: "Log In" }).click();
  await expect(page.getByRole("button", { name: "Log Out" })).toBeVisible();
}

export async function addToCart(page, productId, quantity = 1) {
  await page.goto(`/product/${productId}`);
  for (let i = 1; i < quantity; i++) {
    await page.getByRole("button", { name: "+" }).click();
  }
  await page.getByRole("button", { name: "ADD TO CART" }).click();
  await expect(page).toHaveURL(/\/cart$/);
}

export async function fillShipping(page) {
  await page.getByPlaceholder("Full Name").fill("Test Shopper");
  await page.getByPlaceholder("Phone Number").fill("9876543210");
  await page.getByPlaceholder("Address (house no, street, area)").fill("12 MG Road, Indiranagar");
  await page.getByPlaceholder("City").fill("Bengaluru");
  await page.getByPlaceholder("Pincode").fill("560038");
}

export async function payByCard(page, number) {
  await page.getByPlaceholder("Card Number").fill(number);
  await page.getByPlaceholder("Name on Card").fill("Test Shopper");
  await page.getByPlaceholder("MM/YY").fill("1235");
  await page.getByPlaceholder("CVV").fill("123");
  await page.getByRole("button", { name: /^Pay ₹/ }).click();
}
