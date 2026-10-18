import { describe, expect, test } from "@jest/globals";
import { api, auth, createCustomer } from "./helpers.js";

describe("signup", () => {
  test("creates an account without returning the password hash", async () => {
    const response = await api()
      .post("/signup/user")
      .send({ email: "New.User@Test.dev", pnum: "9123456780", password: "password123" })
      .expect(201);

    expect(response.body).toEqual({ id: expect.any(Number), email: "new.user@test.dev", pnum: "9123456780" });
    expect(response.body).not.toHaveProperty("passhash");
  });

  test("rejects a duplicate email", async () => {
    const customer = await createCustomer();
    const response = await api()
      .post("/signup/user")
      .send({ email: customer.email, pnum: "9000011111", password: "password123" })
      .expect(409);
    expect(response.body.error).toBe("User already exists");
  });

  test.each([
    [{ email: "bad", pnum: "9123456781", password: "password123" }, "Invalid email"],
    [{ email: "a@b.dev", pnum: "123", password: "password123" }, "Phone number must be 10 digits"],
    [{ email: "a@b.dev", pnum: "9123456781", password: "short" }, "Password must be at least 8 characters"],
  ])("validates input %#", async (body, message) => {
    const response = await api().post("/signup/user").send(body).expect(400);
    expect(response.body.error).toBe(message);
  });
});

describe("login", () => {
  test("returns a token for valid credentials", async () => {
    const customer = await createCustomer();
    const response = await api()
      .post("/login")
      .send({ email: customer.email, password: customer.password })
      .expect(200);
    expect(response.body.token).toEqual(expect.any(String));
  });

  test("rejects a wrong password", async () => {
    const customer = await createCustomer();
    const response = await api()
      .post("/login")
      .send({ email: customer.email, password: "wrong-password" })
      .expect(401);
    expect(response.body.error).toBe("Invalid email or password");
  });

  test("rejects malformed JSON", async () => {
    const response = await api()
      .post("/login")
      .set("Content-Type", "application/json")
      .send("{bad json")
      .expect(400);
    expect(response.body.error).toBe("Invalid JSON body");
  });
});

describe("profile", () => {
  test("requires a token", async () => {
    await api().get("/profile").expect(401);
  });

  test("rejects a forged token", async () => {
    await api().get("/profile").set(auth("not.a.real.token")).expect(401);
  });

  test("returns the logged-in user without the password hash", async () => {
    const customer = await createCustomer();
    const response = await api().get("/profile").set(auth(customer.token)).expect(200);
    expect(response.body.email).toBe(customer.email);
    expect(response.body.is_admin).toBe(false);
    expect(response.body).not.toHaveProperty("passhash");
  });
});

describe("security headers", () => {
  test("allows the configured frontend origin only", async () => {
    const allowed = await api().get("/data").set("Origin", "http://localhost:3000");
    expect(allowed.headers["access-control-allow-origin"]).toBe("http://localhost:3000");

    const blocked = await api().get("/data").set("Origin", "https://evil.example");
    expect(blocked.headers["access-control-allow-origin"]).toBeUndefined();
  });

  test("sets helmet headers", async () => {
    const response = await api().get("/data");
    expect(response.headers["x-content-type-options"]).toBe("nosniff");
  });

  test("returns JSON for unknown routes", async () => {
    const response = await api().get("/does-not-exist").expect(404);
    expect(response.body.error).toBe("Route not found");
  });
});
