import { describe, expect, test } from "@jest/globals";
import pool from "../src/config/db.js";
import { api, auth, createCustomer, placeOrder, testCard } from "./helpers.js";

const pay = (token, orderId, body) => api().post(`/orders/${orderId}/pay`).set(auth(token)).send(body);

describe("paying for orders", () => {
  test("a successful card payment marks the order paid", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token);

    const response = await pay(customer.token, order.id, testCard("4242 4242 4242 4242")).expect(200);
    expect(response.body).toMatchObject({ payment_status: "paid", payment_method: "card" });

    const detail = await api().get(`/orders/${order.id}`).set(auth(customer.token));
    expect(detail.body.transaction_id).toBe(response.body.transaction_id);
    expect(detail.body.last_payment).toMatchObject({ card_brand: "Visa", card_last4: "4242" });
  });

  test("a declined card can be retried", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token);

    const declined = await pay(customer.token, order.id, testCard("4000000000000002")).expect(402);
    expect(declined.body).toEqual({ payment_status: "failed", error: "Your card was declined by the bank" });

    await pay(customer.token, order.id, testCard()).expect(200);
  });

  test("an order cannot be paid twice, even at the same time", async () => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token);

    const responses = await Promise.all([
      pay(customer.token, order.id, testCard()),
      pay(customer.token, order.id, testCard()),
    ]);
    expect(responses.map((response) => response.status).sort()).toEqual([200, 409]);
  });

  test("supports UPI and cash on delivery", async () => {
    const customer = await createCustomer();
    const upiOrder = await placeOrder(customer.token, [{ pid: 2, count: 1 }]);
    await pay(customer.token, upiOrder.id, { method: "upi", upiId: "fail@upi" }).expect(402);
    await pay(customer.token, upiOrder.id, { method: "upi", upiId: "test@okaxis" }).expect(200);

    const codOrder = await placeOrder(customer.token, [{ pid: 6, count: 1 }]);
    const cod = await pay(customer.token, codOrder.id, { method: "cod" }).expect(200);
    expect(cod.body.payment_status).toBe("cod");
  });

  test.each([
    [testCard("4242424242424241"), "Please enter a valid card number"],
    [{ ...testCard(), card: { ...testCard().card, expiry: "01/20" } }, "This card has expired"],
    [{ ...testCard(), card: { ...testCard().card, cvv: "1" } }, "CVV must be 3 or 4 digits"],
    [{ method: "upi", upiId: "nope" }, "Please enter a valid UPI ID, like name@bank"],
    [{ method: "bitcoin" }, "Please choose a payment method"],
  ])("validates payment details %#", async (body, message) => {
    const customer = await createCustomer();
    const order = await placeOrder(customer.token);
    const response = await pay(customer.token, order.id, body).expect(400);
    expect(response.body.error).toBe(message);
  });

  test("cannot pay for another customer's order", async () => {
    const owner = await createCustomer();
    const other = await createCustomer();
    const order = await placeOrder(owner.token);
    await pay(other.token, order.id, testCard()).expect(404);
  });

  test("never stores the full card number", async () => {
    const result = await pool.query(
      "SELECT COUNT(*)::int AS count FROM payments WHERE card_last4 !~ '^[0-9]{4}$'"
    );
    expect(result.rows[0].count).toBe(0);
  });
});
