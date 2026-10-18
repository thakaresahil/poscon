import { describe, expect, test } from "@jest/globals";
import pool from "../src/config/db.js";
import { api, auth, createCustomer, placeOrder, shipping } from "./helpers.js";

describe("placing orders", () => {
  test("creates an order from the cart and empties the cart", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token, [
      { pid: 3, count: 2 },
      { pid: 5, count: 1 },
    ]);

    expect(order).toMatchObject({ status: "placed", payment_status: "pending", total: 2 * 1299 + 399 });
    const cart = await api().get("/cartdata").set(auth(customer.token));
    expect(cart.body).toEqual([]);
  });

  test("rejects an empty cart", async () => {
    const customer = await createCustomer();
    const response = await api().post("/orders").set(auth(customer.token)).send(shipping).expect(400);
    expect(response.body.error).toBe("Your cart is empty");
  });

  test("validates the shipping address", async () => {
    const customer = await createCustomer();
    const response = await api()
      .post("/orders")
      .set(auth(customer.token))
      .send({ ...shipping, pincode: "12" })
      .expect(400);
    expect(response.body.error).toBe("Pincode must be 6 digits");
  });

  test("two simultaneous checkouts create only one order", async () => {
    const customer = await createCustomer();
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 1, count: 1 });

    const responses = await Promise.all([
      api().post("/orders").set(auth(customer.token)).send(shipping),
      api().post("/orders").set(auth(customer.token)).send(shipping),
    ]);

    expect(responses.map((response) => response.status).sort()).toEqual([201, 400]);
    const orders = await api().get("/orders").set(auth(customer.token));
    expect(orders.body).toHaveLength(1);
  });
});

describe("viewing orders", () => {
  test("lists and shows the customer's orders with items and address", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token, [{ pid: 3, count: 2 }]);

    const list = await api().get("/orders").set(auth(customer.token)).expect(200);
    expect(list.body[0]).toMatchObject({ id: order.id, item_count: 2 });

    const detail = await api().get(`/orders/${order.id}`).set(auth(customer.token)).expect(200);
    expect(detail.body.items).toEqual([
      expect.objectContaining({ product_name: "Linen Blend Casual Shirt", price: 1299, quantity: 2 }),
    ]);
    expect(detail.body.ship_city).toBe(shipping.city);
  });

  test("keeps the price paid when the product price changes", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token, [{ pid: 4, count: 1 }]);
    const original = (await api().get(`/orders/${order.id}`).set(auth(customer.token))).body.items[0].price;

    await pool.query("UPDATE products SET sellprice = sellprice + 500 WHERE id = 4");
    const after = await api().get(`/orders/${order.id}`).set(auth(customer.token));
    await pool.query("UPDATE products SET sellprice = sellprice - 500 WHERE id = 4");

    expect(after.body.items[0].price).toBe(original);
  });

  test("hides other customers' orders", async () => {
    const owner = await createCustomer();
    const other = await createCustomer();
    const order = await placeOrder(owner.token);

    await api().get(`/orders/${order.id}`).set(auth(other.token)).expect(404);
    const list = await api().get("/orders").set(auth(other.token));
    expect(list.body).toEqual([]);
  });
});
