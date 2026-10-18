import { expect, test } from "@playwright/test";
import { API_URL, demoAdmin, demoCustomer, logIn } from "./helpers.js";

test("an admin adds a product and ships a customer's order", async ({ page, request }) => {
  // Create a customer order through the API so the admin has something to ship
  const login = await request.post(`${API_URL}/login`, { data: demoCustomer });
  const { token } = await login.json();
  const headers = { Authorization: `Bearer ${token}` };
  await request.post(`${API_URL}/addtocart`, { headers, data: { pid: 2, count: 1, size: "M" } });
  const orderResponse = await request.post(`${API_URL}/orders`, {
    headers,
    data: { name: "Demo User", phone: "9999999999", address: "221B Baker Street", city: "Mumbai", pincode: "400001" },
  });
  const order = await orderResponse.json();
  const orderNumber = `#${String(order.id).padStart(6, "0")}`;

  await logIn(page, demoAdmin);
  await page.getByRole("link", { name: "Admin", exact: true }).click();
  await expect(page.getByText("Revenue, last 30 days")).toBeVisible();

  await test.step("add a product", async () => {
    await page.getByRole("link", { name: "Products", exact: true }).click();
    await page.getByRole("link", { name: "Add Product" }).click();
    await page.getByLabel("Name").fill("Playwright Test Jacket");
    await page.getByLabel("Image URL").fill("https://placehold.co/400x500?text=Jacket");
    await page.getByLabel("Price (₹)", { exact: true }).fill("3000");
    await page.getByLabel("Sale Price (₹)").fill("2400");
    await page.getByLabel("Category").fill("winterwear");
    await expect(page.getByText("(20% OFF)")).toBeVisible();
    await page.getByRole("button", { name: "Add Product" }).click();
    await expect(page.getByRole("link", { name: "Playwright Test Jacket" })).toBeVisible();

    await page.goto("/browseproduct?q=playwright");
    await expect(page.getByText("At ₹2400")).toBeVisible();
  });

  await test.step("ship the order", async () => {
    await page.goto("/admin/orders");
    const row = page.getByRole("row").filter({ hasText: orderNumber });
    await row.getByRole("combobox").selectOption("shipped");
    await expect(row.getByText("Shipped", { exact: true })).toBeVisible();
  });

  await test.step("the customer sees the new status", async () => {
    await page.getByRole("button", { name: "Log Out" }).click();
    await logIn(page, demoCustomer);
    await page.goto(`/orders/${order.id}`);
    await expect(page.getByText("Shipped", { exact: true })).toBeVisible();
  });
});
