import { beforeAll, describe, expect, test } from "@jest/globals";
import { adminToken, api, auth, createCustomer, placeOrder, testCard } from "./helpers.js";

let admin;

beforeAll(async () => {
  admin = await adminToken();
});

const newProduct = {
  namee: "Test Linen Kurta",
  description: "Made for tests",
  img: "https://placehold.co/400x500",
  price: 2000,
  sellprice: 1500,
  gender: "men",
  category: "Kurtas",
  is_bestseller: true,
};

describe("admin access", () => {
  test("requires login and the admin role", async () => {
    const customer = await createCustomer();
    await api().get("/admin/stats").expect(401);
    const forbidden = await api().get("/admin/stats").set(auth(customer.token)).expect(403);
    expect(forbidden.body.error).toBe("Admin access required");
  });

  test("profile reports the admin role", async () => {
    const response = await api().get("/profile").set(auth(admin));
    expect(response.body.is_admin).toBe(true);
  });
});

describe("dashboard stats", () => {
  test("counts paid orders as revenue and leaves out unpaid ones", async () => {
    const before = (await api().get("/admin/stats").set(auth(admin))).body;

    const customer = await createCustomer();
    const paid = await placeOrder(customer.token, [{ pid: 3, count: 1 }]);
    await api().post(`/orders/${paid.id}/pay`).set(auth(customer.token)).send(testCard());
    await placeOrder(customer.token, [{ pid: 5, count: 1 }]);

    const after = (await api().get("/admin/stats").set(auth(admin))).body;
    expect(after.revenue - before.revenue).toBe(1299);
    expect(after.orders - before.orders).toBe(2);
    expect(after.daily).toHaveLength(30);
    expect(after.recentOrders.length).toBeGreaterThan(0);
  });
});

describe("managing orders", () => {
  test("moves an order through its statuses and blocks invalid changes", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token);
    const setStatus = (status) =>
      api().patch(`/admin/orders/${order.id}`).set(auth(admin)).send({ status });

    const skip = await setStatus("delivered").expect(409);
    expect(skip.body.error).toBe("An order that is placed cannot be marked as delivered");
    await setStatus("shipped").expect(200);
    await setStatus("delivered").expect(200);
    await setStatus("cancelled").expect(409);

    const seen = await api().get(`/orders/${order.id}`).set(auth(customer.token));
    expect(seen.body.status).toBe("delivered");
  });

  test("lists and filters all orders", async () => {
    const response = await api().get("/admin/orders").query({ status: "placed" }).set(auth(admin)).expect(200);
    expect(response.body.orders.every((order) => order.status === "placed")).toBe(true);
    await api().get("/admin/orders").query({ status: "lost" }).set(auth(admin)).expect(400);
  });

  test("customers cannot change order status", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token);
    await api().patch(`/admin/orders/${order.id}`).set(auth(customer.token)).send({ status: "shipped" }).expect(403);
  });
});

describe("managing products", () => {
  test("creates, updates and deletes a product", async () => {
    const created = await api().post("/admin/products").set(auth(admin)).send(newProduct).expect(201);
    expect(created.body).toMatchObject({ namee: "Test Linen Kurta", category: "kurtas" });

    await api()
      .put(`/admin/products/${created.body.id}`)
      .set(auth(admin))
      .send({ ...newProduct, sellprice: 999 })
      .expect(200);
    const updated = await api().get(`/products/${created.body.id}`);
    expect(updated.body.sellprice).toBe(999);

    await api().delete(`/admin/products/${created.body.id}`).set(auth(admin)).expect(204);
    await api().get(`/products/${created.body.id}`).expect(404);
  });

  test.each([
    [{ sellprice: 3000 }, "Sale price cannot be more than the original price"],
    [{ img: "not-a-url" }, "Image must be a full URL or a path like /products/shirt.svg"],
    [{ img: "javascript:alert(1)" }, "Image must be a full URL or a path like /products/shirt.svg"],
    [{ category: "Tops & Tees" }, "Category can only use letters, numbers and dashes"],
  ])("validates product fields %#", async (change, message) => {
    const response = await api()
      .post("/admin/products")
      .set(auth(admin))
      .send({ ...newProduct, ...change })
      .expect(400);
    expect(response.body.error).toBe(message);
  });

  test("deleting a product keeps past orders intact", async () => {
    const product = (await api().post("/admin/products").set(auth(admin)).send(newProduct)).body;
    const customer = await createCustomer();
    const order = await placeOrder(customer.token, [{ pid: product.id, count: 1 }]);

    await api().delete(`/admin/products/${product.id}`).set(auth(admin)).expect(204);

    const detail = await api().get(`/orders/${order.id}`).set(auth(customer.token));
    expect(detail.body.items[0]).toMatchObject({ product_name: "Test Linen Kurta", product_id: null });
  });

  test("customers cannot manage products", async () => {
    const customer = await createCustomer();
    await api().post("/admin/products").set(auth(customer.token)).send(newProduct).expect(403);
  });
});
