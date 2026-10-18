import request from "supertest";
import app from "../src/app.js";

export const api = () => request(app);

let userCount = 0;

// Signs up a new customer with unique details and returns their token
export const createCustomer = async () => {
  userCount += 1;
  const unique = `${Date.now()}${userCount}`.slice(-9);
  const user = {
    email: `customer${unique}@test.dev`,
    pnum: `9${unique}`,
    password: "password123",
  };
  await api().post("/signup/user").send(user).expect(201);
  const login = await api().post("/login").send({ email: user.email, password: user.password });
  return { ...user, token: login.body.token, uid: login.body.uid };
};

export const loginAs = async (email, password) => {
  const response = await api().post("/login").send({ email, password }).expect(200);
  return response.body.token;
};

export const adminToken = () => loginAs("admin@poscon.dev", "admin1234");

export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const shipping = {
  name: "Test Customer",
  phone: "9876543210",
  address: "12 MG Road, Indiranagar",
  city: "Bengaluru",
  pincode: "560038",
};

export const testCard = (number = "4242424242424242") => ({
  method: "card",
  card: { number, name: "Test Customer", expiry: "12/35", cvv: "123" },
});

// Adds products to the customer's cart and places an order, returning the order
export const placeOrder = async (token, items = [{ pid: 1, count: 1, size: "M" }]) => {
  for (const item of items) {
    await api().post("/addtocart").set(auth(token)).send(item).expect(201);
  }
  const response = await api().post("/orders").set(auth(token)).send(shipping).expect(201);
  return response.body;
};
