import { describe, expect, test } from "@jest/globals";
import { api, auth, createCustomer, loginAs } from "./helpers.js";

const address = { address: "12 MG Road, Indiranagar", city: "Bengaluru", pincode: "560038" };

describe("updating the profile", () => {
  test("saves name, phone and delivery address", async () => {
    const customer = await createCustomer();
    const response = await api()
      .patch("/profile")
      .set(auth(customer.token))
      .send({ name: "Asha Rao", pnum: customer.pnum, ...address })
      .expect(200);

    expect(response.body).toMatchObject({ name: "Asha Rao", email: customer.email, ...address });
    const profile = await api().get("/profile").set(auth(customer.token));
    expect(profile.body).toMatchObject({ name: "Asha Rao", ...address });
  });

  test("clears optional fields sent as empty strings", async () => {
    const customer = await createCustomer();
    await api().patch("/profile").set(auth(customer.token)).send({ pnum: customer.pnum, ...address });
    const response = await api()
      .patch("/profile")
      .set(auth(customer.token))
      .send({ pnum: customer.pnum, name: "", address: "", city: "", pincode: "" })
      .expect(200);
    expect(response.body).toMatchObject({ name: null, address: null, city: null, pincode: null });
  });

  test("rejects a phone number used by another account", async () => {
    const first = await createCustomer();
    const second = await createCustomer();
    const response = await api().patch("/profile").set(auth(second.token)).send({ pnum: first.pnum }).expect(409);
    expect(response.body.error).toBe("This phone number is already used by another account");
  });

  test.each([
    [{ pnum: "123" }, "Phone number must be 10 digits"],
    [{ pincode: "12" }, "Pincode must be 6 digits"],
  ])("validates input %#", async (change, error) => {
    const customer = await createCustomer();
    const response = await api()
      .patch("/profile")
      .set(auth(customer.token))
      .send({ pnum: customer.pnum, ...change })
      .expect(400);
    expect(response.body.error).toBe(error);
  });

  test("requires login", async () => {
    await api().patch("/profile").send({ pnum: "9000000001" }).expect(401);
  });
});

describe("changing the password", () => {
  test("changes the password when the current one is right", async () => {
    const customer = await createCustomer();
    await api()
      .patch("/profile/password")
      .set(auth(customer.token))
      .send({ currentPassword: customer.password, newPassword: "brand-new-pass" })
      .expect(200);

    await api().post("/login").send({ email: customer.email, password: customer.password }).expect(401);
    await expect(loginAs(customer.email, "brand-new-pass")).resolves.toEqual(expect.any(String));
  });

  test.each([
    [{ currentPassword: "wrong-password", newPassword: "brand-new-pass" }, "Current password is incorrect"],
    [{ currentPassword: "password123", newPassword: "short" }, "New password must be at least 8 characters"],
    [{ currentPassword: "password123", newPassword: "password123" }, "New password must be different from the current one"],
  ])("rejects invalid changes %#", async (body, error) => {
    const customer = await createCustomer();
    const response = await api().patch("/profile/password").set(auth(customer.token)).send(body).expect(400);
    expect(response.body.error).toBe(error);
  });
});
