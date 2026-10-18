import { describe, expect, test } from "@jest/globals";
import SwaggerParser from "@apidevtools/swagger-parser";
import app from "../src/app.js";
import openapi from "../src/docs/openapi.js";
import { adminToken, api, auth, createCustomer, placeOrder, testCard } from "./helpers.js";

const METHODS = ["get", "post", "put", "patch", "delete"];

// Lists every route registered on the Express app as "METHOD /path/{param}"
const appRoutes = () => {
  const routes = [];
  const visit = (stack) => {
    for (const layer of stack) {
      if (layer.route) {
        const path = layer.route.path.replace(/:(\w+)(\([^)]*\))?/g, "{$1}");
        for (const method of Object.keys(layer.route.methods)) {
          routes.push(`${method.toUpperCase()} ${path}`);
        }
      } else if (layer.handle?.stack) {
        visit(layer.handle.stack);
      }
    }
  };
  visit(app._router.stack);
  return routes.filter((route) => !route.includes(" /docs"));
};

const specRoutes = () =>
  Object.entries(openapi.paths).flatMap(([path, operations]) =>
    Object.keys(operations)
      .filter((method) => METHODS.includes(method))
      .map((method) => `${method.toUpperCase()} ${path}`)
  );

const schemaFor = (path, method, status) => {
  const resolve = (schema) =>
    schema.$ref ? openapi.components.schemas[schema.$ref.split("/").pop()] : schema;
  const content = openapi.paths[path][method].responses[status].content["application/json"];
  return resolve(content.schema);
};

const documentedKeys = (schema) => Object.keys(schema.properties).sort();

describe("OpenAPI spec", () => {
  test("is a valid OpenAPI 3 document", async () => {
    await expect(SwaggerParser.validate(structuredClone(openapi))).resolves.toBeDefined();
  });

  test("documents every route and no routes that do not exist", () => {
    expect(specRoutes().sort()).toEqual(appRoutes().sort());
  });

  test("every protected route documents the 401 response", () => {
    for (const [path, operations] of Object.entries(openapi.paths)) {
      for (const [method, operation] of Object.entries(operations)) {
        if (operation.security) {
          expect({ route: `${method} ${path}`, has401: Boolean(operation.responses[401]) }).toEqual({
            route: `${method} ${path}`,
            has401: true,
          });
        }
      }
    }
  });

  test("is served as JSON and as Swagger UI", async () => {
    const spec = await api().get("/docs/openapi.json").expect(200);
    expect(spec.body.info.title).toBe("Poscon API");
    const page = await api().get("/docs/").expect(200);
    expect(page.text).toContain("swagger-ui");
  });
});

describe("responses match the documented fields", () => {
  test("GET /products", async () => {
    const response = await api().get("/products").expect(200);
    expect(Object.keys(response.body).sort()).toEqual(documentedKeys(schemaFor("/products", "get", 200)));
    expect(Object.keys(response.body.products[0]).sort()).toEqual(
      documentedKeys(openapi.components.schemas.Product)
    );
  });

  test("GET /profile", async () => {
    const customer = await createCustomer();
    const response = await api().get("/profile").set(auth(customer.token)).expect(200);
    expect(Object.keys(response.body).sort()).toEqual(documentedKeys(openapi.components.schemas.Profile));
  });

  test("GET /cartdata and GET /orders/{id}", async () => {
    const customer = await createCustomer();
    await api().post("/addtocart").set(auth(customer.token)).send({ pid: 3, count: 1 });
    const cart = await api().get("/cartdata").set(auth(customer.token)).expect(200);
    expect(Object.keys(cart.body[0]).sort()).toEqual(documentedKeys(openapi.components.schemas.CartItem));

    await api().delete(`/cart/${cart.body[0].id}`).set(auth(customer.token));
    const order = await placeOrder(customer.token);
    await api().post(`/orders/${order.id}/pay`).set(auth(customer.token)).send(testCard());
    const detail = await api().get(`/orders/${order.id}`).set(auth(customer.token)).expect(200);
    expect(Object.keys(detail.body).sort()).toEqual(documentedKeys(openapi.components.schemas.OrderDetail));

    const list = await api().get("/orders").set(auth(customer.token)).expect(200);
    expect(Object.keys(list.body[0]).sort()).toEqual(documentedKeys(openapi.components.schemas.OrderSummary));
  });

  test("GET /admin/stats", async () => {
    const response = await api().get("/admin/stats").set(auth(await adminToken())).expect(200);
    expect(Object.keys(response.body).sort()).toEqual(documentedKeys(openapi.components.schemas.Stats));
  });
});
