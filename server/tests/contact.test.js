import { beforeAll, describe, expect, test } from "@jest/globals";
import { adminToken, api, auth, createCustomer } from "./helpers.js";

const message = {
  name: "Asha Rao",
  email: "Asha@Example.com",
  subject: "Order question",
  message: "When will my order be shipped?",
};

let admin;

beforeAll(async () => {
  admin = await adminToken();
});

describe("contact form", () => {
  test("saves a message without needing to log in", async () => {
    const response = await api().post("/contact").send(message).expect(201);
    expect(response.body).toMatchObject({ status: "Sent", id: expect.any(Number) });
  });

  test.each([
    [{ name: "A" }, "Please enter your name"],
    [{ email: "not-an-email" }, "Please enter a valid email"],
    [{ message: "Too short" }, "Please write at least 10 characters"],
    [{ message: "x".repeat(2001) }, "Messages can be up to 2000 characters"],
  ])("validates the message %#", async (change, error) => {
    const response = await api().post("/contact").send({ ...message, ...change }).expect(400);
    expect(response.body.error).toBe(error);
  });
});

describe("admin messages", () => {
  test("only admins can read messages", async () => {
    const customer = await createCustomer();
    await api().get("/admin/messages").expect(401);
    await api().get("/admin/messages").set(auth(customer.token)).expect(403);
  });

  test("lists messages newest first and marks them read", async () => {
    const sent = (await api().post("/contact").send({ ...message, subject: "Newest" })).body;

    const list = await api().get("/admin/messages").set(auth(admin)).expect(200);
    expect(list.body.messages[0]).toMatchObject({
      id: sent.id,
      email: "asha@example.com",
      subject: "Newest",
      status: "new",
    });
    const unreadBefore = list.body.unread;

    await api().patch(`/admin/messages/${sent.id}`).set(auth(admin)).send({ status: "read" }).expect(200);

    const unread = await api().get("/admin/messages").query({ status: "new" }).set(auth(admin));
    expect(unread.body.messages.some((item) => item.id === sent.id)).toBe(false);
    expect(unread.body.unread).toBe(unreadBefore - 1);
  });

  test("counts unread messages on the dashboard", async () => {
    const before = (await api().get("/admin/stats").set(auth(admin))).body.new_messages;
    await api().post("/contact").send(message);
    const after = (await api().get("/admin/stats").set(auth(admin))).body.new_messages;
    expect(after).toBe(before + 1);
  });

  test("rejects unknown messages and invalid statuses", async () => {
    await api().patch("/admin/messages/999999").set(auth(admin)).send({ status: "read" }).expect(404);
    await api().patch("/admin/messages/1").set(auth(admin)).send({ status: "archived" }).expect(400);
  });
});
