import { beforeEach, describe, expect, test } from "@jest/globals";
import { api, auth, createCustomer } from "./helpers.js";

let customer;

beforeEach(async () => {
  customer = await createCustomer();
});

const getCart = async (token) => (await api().get("/cartdata").set(auth(token)).expect(200)).body;

describe("cart", () => {
  test("requires login", async () => {
    await api().get("/cartdata").expect(401);
    await api().post("/addtocart").send({ pid: 1, count: 1 }).expect(401);
  });

  test("adding the same product twice increases its quantity", async () => {
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 3, count: 2 }).expect(201);
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 3, count: 3 }).expect(201);

    const cart = await getCart(customer.token);
    expect(cart).toHaveLength(1);
    expect(cart[0]).toMatchObject({ product_id: 3, quantity: 5 });
  });

  test("caps quantity at 10", async () => {
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 3, count: 8 });
    const response = await api().post("/addtocart").set(auth(customer.token)).send({ pid: 3, count: 8 });
    expect(response.body.item.quantity).toBe(10);
  });

  test("rejects invalid quantities and unknown products", async () => {
    const zero = await api().post("/addtocart").set(auth(customer.token)).send({ pid: 3, count: 0 }).expect(400);
    expect(zero.body.error).toBe("Quantity must be between 1 and 10");
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 999999, count: 1 }).expect(404);
  });

  test("updates and removes items", async () => {
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 5, count: 1 });
    const [item] = await getCart(customer.token);

    await api().patch(`/cart/${item.id}`).set(auth(customer.token)).send({ quantity: 4 }).expect(200);
    expect((await getCart(customer.token))[0].quantity).toBe(4);

    await api().delete(`/cart/${item.id}`).set(auth(customer.token)).expect(204);
    expect(await getCart(customer.token)).toEqual([]);
    await api().delete(`/cart/${item.id}`).set(auth(customer.token)).expect(404);
  });

  test("cannot change another customer's cart", async () => {
    const other = await createCustomer();
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 5, count: 1 });
    const [item] = await getCart(customer.token);

    await api().patch(`/cart/${item.id}`).set(auth(other.token)).send({ quantity: 2 }).expect(404);
    await api().delete(`/cart/${item.id}`).set(auth(other.token)).expect(404);
    expect((await getCart(customer.token))[0].quantity).toBe(1);
  });

  test("ignores a uid sent in the body", async () => {
    const other = await createCustomer();
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 7, count: 1, uid: other.uid });
    expect(await getCart(other.token)).toEqual([]);
    expect(await getCart(customer.token)).toHaveLength(1);
  });
});
