import { describe, expect, test } from "@jest/globals";
import { api } from "./helpers.js";

describe("GET /products", () => {
  test("returns the first page with totals", async () => {
    const response = await api().get("/products").expect(200);
    expect(response.body.products).toHaveLength(12);
    expect(response.body).toMatchObject({ page: 1, limit: 12 });
    expect(response.body.total).toBeGreaterThanOrEqual(35);
  });

  test("searches name, description and category case-insensitively", async () => {
    const response = await api().get("/products").query({ q: "LINEN" }).expect(200);
    expect(response.body.products.map((product) => product.namee)).toContain("Linen Blend Casual Shirt");
  });

  test("treats LIKE wildcards in the search literally", async () => {
    // Unescaped, "_" would match every product
    const underscore = await api().get("/products").query({ q: "_" }).expect(200);
    expect(underscore.body.total).toBe(0);

    const percent = await api().get("/products").query({ q: "100%" }).expect(200);
    expect(percent.body.products.map((product) => product.namee)).toEqual(["Essential Crew Neck T-Shirt"]);
  });

  test("filters by gender, category and price", async () => {
    const response = await api()
      .get("/products")
      .query({ gender: "women", category: "accessories", minPrice: 500, maxPrice: 1000, limit: 48 })
      .expect(200);

    expect(response.body.total).toBeGreaterThan(0);
    for (const product of response.body.products) {
      expect(product.gender).toBe("women");
      expect(product.category).toBe("accessories");
      expect(product.sellprice).toBeGreaterThanOrEqual(500);
      expect(product.sellprice).toBeLessThanOrEqual(1000);
    }
  });

  test.each([
    ["price_asc", (a, b) => a.sellprice <= b.sellprice],
    ["price_desc", (a, b) => a.sellprice >= b.sellprice],
  ])("sorts by %s", async (sort, inOrder) => {
    const response = await api().get("/products").query({ sort, limit: 48 }).expect(200);
    const products = response.body.products;
    for (let i = 1; i < products.length; i++) {
      expect(inOrder(products[i - 1], products[i])).toBe(true);
    }
  });

  test("paginates without overlap", async () => {
    const first = await api().get("/products").query({ page: 1, limit: 10 });
    const second = await api().get("/products").query({ page: 2, limit: 10 });
    const firstIds = first.body.products.map((product) => product.id);
    const secondIds = second.body.products.map((product) => product.id);
    expect(firstIds.some((id) => secondIds.includes(id))).toBe(false);
  });

  test.each([
    [{ sort: "random" }, "Invalid sort option"],
    [{ gender: "kids" }, "Gender must be men or women"],
    [{ minPrice: 900, maxPrice: 100 }, "Minimum price cannot be more than maximum price"],
    [{ limit: 500 }, "You can request up to 48 products per page"],
  ])("rejects invalid query %#", async (query, message) => {
    const response = await api().get("/products").query(query).expect(400);
    expect(response.body.error).toBe(message);
  });
});

describe("other product endpoints", () => {
  test("lists categories with counts", async () => {
    const response = await api().get("/products/categories").expect(200);
    expect(response.body).toContainEqual({ category: "accessories", count: expect.any(Number) });
  });

  test("returns one product", async () => {
    const response = await api().get("/products/3").expect(200);
    expect(response.body.namee).toBe("Linen Blend Casual Shirt");
  });

  test.each(["999999", "abc"])("returns 404 for product %s", async (id) => {
    await api().get(`/products/${id}`).expect(404);
  });

  test("returns bestsellers and latest products", async () => {
    const bestsellers = await api().get("/home/bestseller").expect(200);
    expect(bestsellers.body.length).toBeGreaterThan(0);
    const latest = await api().get("/data").expect(200);
    expect(latest.body).toHaveLength(8);
  });
});
