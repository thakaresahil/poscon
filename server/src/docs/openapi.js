// OpenAPI description of the Poscon API, served as interactive docs at /docs

const errorResponse = (description, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { error: example },
    },
  },
});

const json = (schema, description = "Success") => ({
  description,
  content: { "application/json": { schema } },
});

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });

const idParam = (description) => ({
  name: "id",
  in: "path",
  required: true,
  description,
  schema: { type: "integer", minimum: 1 },
});

const loggedIn = [{ bearerAuth: [] }];

const responses = {
  BadRequest: { $ref: "#/components/responses/BadRequest" },
  Unauthorized: { $ref: "#/components/responses/Unauthorized" },
  Forbidden: { $ref: "#/components/responses/Forbidden" },
  NotFound: { $ref: "#/components/responses/NotFound" },
  Conflict: { $ref: "#/components/responses/Conflict" },
};

const openapi = {
  openapi: "3.0.3",
  info: {
    title: "Poscon API",
    version: "1.0.0",
    description:
      "REST API for the Poscon clothing store.\n\n" +
      "**Trying protected endpoints:** call `POST /login` with `demo@poscon.dev` / `demo1234` " +
      "(or `admin@poscon.dev` / `admin1234` for admin endpoints), copy the `token` from the response, " +
      "click **Authorize** and paste it in.\n\n" +
      "Payments are simulated; see the `POST /orders/{id}/pay` endpoint for test card numbers.",
    license: { name: "MIT", url: "https://opensource.org/licenses/MIT" },
  },
  servers: [{ url: "/", description: "This server" }],
  tags: [
    { name: "Auth", description: "Sign up, log in and the current user" },
    { name: "Products", description: "Catalogue, search and filters" },
    { name: "Cart", description: "The logged-in user's cart" },
    { name: "Orders", description: "Checkout, order history and simulated payments" },
    { name: "Admin", description: "Store management, admin role required" },
  ],
  paths: {
    "/signup/user": {
      post: {
        tags: ["Auth"],
        summary: "Create an account",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("SignupRequest"),
              example: { email: "new.user@example.com", pnum: "9876543210", password: "password123" },
            },
          },
        },
        responses: {
          201: json(ref("NewUser"), "Account created"),
          400: responses.BadRequest,
          409: errorResponse("An account with this email or phone number exists", "User already exists"),
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },
    "/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in and receive a token",
        description: "The token is valid for 7 days. Send it as `Authorization: Bearer <token>`.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("LoginRequest"),
              example: { email: "demo@poscon.dev", password: "demo1234" },
            },
          },
        },
        responses: {
          200: json(ref("LoginResponse"), "Logged in"),
          400: responses.BadRequest,
          401: errorResponse("Wrong email or password", "Invalid email or password"),
          429: { $ref: "#/components/responses/TooManyRequests" },
        },
      },
    },
    "/profile": {
      get: {
        tags: ["Auth"],
        summary: "The logged-in user's profile",
        security: loggedIn,
        responses: {
          200: json(ref("Profile")),
          401: responses.Unauthorized,
          404: responses.NotFound,
        },
      },
    },
    "/data": {
      get: {
        tags: ["Products"],
        summary: "The 8 newest products, for the home page",
        responses: { 200: json({ type: "array", items: ref("Product") }) },
      },
    },
    "/home/bestseller": {
      get: {
        tags: ["Products"],
        summary: "Products marked as bestsellers",
        responses: { 200: json({ type: "array", items: ref("Bestseller") }) },
      },
    },
    "/products": {
      get: {
        tags: ["Products"],
        summary: "Search, filter, sort and page through products",
        parameters: [
          { name: "q", in: "query", description: "Text to find in the name, description or category", schema: { type: "string", maxLength: 100 } },
          { name: "gender", in: "query", schema: { type: "string", enum: ["men", "women"] } },
          { name: "category", in: "query", description: "A category from `/products/categories`", schema: { type: "string", example: "accessories" } },
          { name: "minPrice", in: "query", description: "Lowest sale price in rupees", schema: { type: "integer", minimum: 0 } },
          { name: "maxPrice", in: "query", description: "Highest sale price in rupees", schema: { type: "integer", minimum: 0 } },
          {
            name: "sort",
            in: "query",
            description: "`popular` orders by units sold",
            schema: { type: "string", enum: ["newest", "popular", "price_asc", "price_desc", "discount"], default: "newest" },
          },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 48, default: 12 } },
        ],
        responses: {
          200: json(ref("ProductPage")),
          400: responses.BadRequest,
        },
      },
    },
    "/products/categories": {
      get: {
        tags: ["Products"],
        summary: "Categories with the number of products in each",
        responses: {
          200: json({
            type: "array",
            items: {
              type: "object",
              properties: { category: { type: "string", example: "shirts" }, count: { type: "integer", example: 4 } },
            },
          }),
        },
      },
    },
    "/products/{id}": {
      get: {
        tags: ["Products"],
        summary: "A single product",
        parameters: [idParam("Product id")],
        responses: { 200: json(ref("Product")), 404: responses.NotFound },
      },
    },
    "/cartdata": {
      get: {
        tags: ["Cart"],
        summary: "Items in the cart",
        security: loggedIn,
        responses: {
          200: json({ type: "array", items: ref("CartItem") }),
          401: responses.Unauthorized,
        },
      },
    },
    "/addtocart": {
      post: {
        tags: ["Cart"],
        summary: "Add a product to the cart",
        description: "Adding a product that is already in the cart increases its quantity, up to 10.",
        security: loggedIn,
        requestBody: {
          required: true,
          content: { "application/json": { schema: ref("AddToCartRequest"), example: { pid: 3, count: 2 } } },
        },
        responses: {
          201: json(
            {
              type: "object",
              properties: {
                status: { type: "string", example: "Added" },
                item: {
                  type: "object",
                  properties: {
                    id: { type: "integer" },
                    product_id: { type: "integer" },
                    quantity: { type: "integer" },
                  },
                },
              },
            },
            "Added to the cart"
          ),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          404: responses.NotFound,
        },
      },
    },
    "/cart/{id}": {
      patch: {
        tags: ["Cart"],
        summary: "Change the quantity of a cart item",
        security: loggedIn,
        parameters: [idParam("Cart item id (the `id` from `/cartdata`)")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                required: ["quantity"],
                properties: { quantity: { type: "integer", minimum: 1, maximum: 10 } },
              },
              example: { quantity: 3 },
            },
          },
        },
        responses: {
          200: json({
            type: "object",
            properties: { id: { type: "integer" }, product_id: { type: "integer" }, quantity: { type: "integer" } },
          }),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          404: responses.NotFound,
        },
      },
      delete: {
        tags: ["Cart"],
        summary: "Remove an item from the cart",
        security: loggedIn,
        parameters: [idParam("Cart item id")],
        responses: {
          204: { description: "Removed" },
          401: responses.Unauthorized,
          404: responses.NotFound,
        },
      },
    },
    "/orders": {
      post: {
        tags: ["Orders"],
        summary: "Place an order from the cart",
        description:
          "Creates the order and empties the cart in one transaction. The order starts with `payment_status` " +
          "`pending`; pay for it with `POST /orders/{id}/pay`.",
        security: loggedIn,
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("Shipping"),
              example: { name: "Demo User", phone: "9999999999", address: "221B Baker Street", city: "Mumbai", pincode: "400001" },
            },
          },
        },
        responses: {
          201: json(
            {
              type: "object",
              properties: {
                id: { type: "integer" },
                status: ref("OrderStatus"),
                total: { type: "integer" },
                payment_status: ref("PaymentStatus"),
                created_at: { type: "string", format: "date-time" },
              },
            },
            "Order placed"
          ),
          400: errorResponse("Invalid address or an empty cart", "Your cart is empty"),
          401: responses.Unauthorized,
        },
      },
      get: {
        tags: ["Orders"],
        summary: "The user's orders, newest first",
        security: loggedIn,
        responses: {
          200: json({ type: "array", items: ref("OrderSummary") }),
          401: responses.Unauthorized,
        },
      },
    },
    "/orders/{id}": {
      get: {
        tags: ["Orders"],
        summary: "One of the user's orders, with items and payment details",
        security: loggedIn,
        parameters: [idParam("Order id")],
        responses: {
          200: json(ref("OrderDetail")),
          401: responses.Unauthorized,
          404: responses.NotFound,
        },
      },
    },
    "/orders/{id}/pay": {
      post: {
        tags: ["Orders"],
        summary: "Pay for an order (simulated)",
        description:
          "No real payment is made. Test values:\n\n" +
          "| Method | Value | Result |\n|---|---|---|\n" +
          "| card | `4242 4242 4242 4242` | Succeeds |\n" +
          "| card | `4000 0000 0000 0002` | Declined |\n" +
          "| card | `4000 0000 0000 9995` | Insufficient funds |\n" +
          "| upi | `demo@okaxis` | Succeeds |\n" +
          "| upi | `fail@upi` | Declined |\n\n" +
          "Only the card brand and last four digits are stored.",
        security: loggedIn,
        parameters: [idParam("Order id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: ref("PaymentRequest"),
              examples: {
                card: {
                  summary: "Card",
                  value: { method: "card", card: { number: "4242 4242 4242 4242", name: "Demo User", expiry: "12/30", cvv: "123" } },
                },
                upi: { summary: "UPI", value: { method: "upi", upiId: "demo@okaxis" } },
                cod: { summary: "Cash on delivery", value: { method: "cod" } },
              },
            },
          },
        },
        responses: {
          200: json(
            {
              type: "object",
              properties: {
                payment_status: { type: "string", enum: ["paid", "cod"] },
                payment_method: { type: "string", enum: ["card", "upi", "cod"] },
                transaction_id: { type: "string", example: "TXN0DA50FFFBF66" },
              },
            },
            "Payment succeeded, or cash on delivery chosen"
          ),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          402: json(
            {
              type: "object",
              properties: {
                payment_status: { type: "string", enum: ["failed"] },
                error: { type: "string", example: "Your card was declined by the bank" },
              },
            },
            "Payment declined; the order stays unpaid and can be retried"
          ),
          404: responses.NotFound,
          409: errorResponse("The order is already paid", "Payment for this order is already complete"),
        },
      },
    },
    "/admin/stats": {
      get: {
        tags: ["Admin"],
        summary: "Dashboard totals and charts",
        description: "Revenue counts paid and cash on delivery orders, excluding cancelled ones.",
        security: loggedIn,
        responses: {
          200: json(ref("Stats")),
          401: responses.Unauthorized,
          403: responses.Forbidden,
        },
      },
    },
    "/admin/orders": {
      get: {
        tags: ["Admin"],
        summary: "All orders",
        security: loggedIn,
        parameters: [
          { name: "status", in: "query", schema: ref("OrderStatus") },
          { name: "page", in: "query", schema: { type: "integer", minimum: 1, default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", minimum: 1, maximum: 50, default: 20 } },
        ],
        responses: {
          200: json({
            type: "object",
            properties: {
              orders: { type: "array", items: ref("AdminOrder") },
              total: { type: "integer" },
              page: { type: "integer" },
              limit: { type: "integer" },
              totalPages: { type: "integer" },
            },
          }),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          403: responses.Forbidden,
        },
      },
    },
    "/admin/orders/{id}": {
      patch: {
        tags: ["Admin"],
        summary: "Change an order's status",
        description: "Allowed changes: placed → shipped or cancelled, shipped → delivered or cancelled.",
        security: loggedIn,
        parameters: [idParam("Order id")],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: { type: "object", required: ["status"], properties: { status: ref("OrderStatus") } },
              example: { status: "shipped" },
            },
          },
        },
        responses: {
          200: json({ type: "object", properties: { id: { type: "integer" }, status: ref("OrderStatus") } }),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          403: responses.Forbidden,
          404: responses.NotFound,
          409: errorResponse("The change is not allowed", "An order that is delivered cannot be marked as cancelled"),
        },
      },
    },
    "/admin/products": {
      post: {
        tags: ["Admin"],
        summary: "Create a product",
        security: loggedIn,
        requestBody: { required: true, content: { "application/json": { schema: ref("ProductInput") } } },
        responses: {
          201: json(ref("Product"), "Created"),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          403: responses.Forbidden,
        },
      },
    },
    "/admin/products/{id}": {
      put: {
        tags: ["Admin"],
        summary: "Update a product",
        security: loggedIn,
        parameters: [idParam("Product id")],
        requestBody: { required: true, content: { "application/json": { schema: ref("ProductInput") } } },
        responses: {
          200: json(ref("Product")),
          400: responses.BadRequest,
          401: responses.Unauthorized,
          403: responses.Forbidden,
          404: responses.NotFound,
        },
      },
      delete: {
        tags: ["Admin"],
        summary: "Delete a product",
        description: "Past orders keep their own copy of the product name, image and price.",
        security: loggedIn,
        parameters: [idParam("Product id")],
        responses: {
          204: { description: "Deleted" },
          401: responses.Unauthorized,
          403: responses.Forbidden,
          404: responses.NotFound,
        },
      },
    },
  },
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    responses: {
      BadRequest: errorResponse("Invalid input", "Quantity must be between 1 and 10"),
      Unauthorized: errorResponse("Missing, invalid or expired token", "Please log in"),
      Forbidden: errorResponse("The user is not an admin", "Admin access required"),
      NotFound: errorResponse("Not found, or it belongs to another user", "Order not found"),
      Conflict: errorResponse("The request conflicts with the current state", "User already exists"),
      TooManyRequests: errorResponse("Too many attempts in 15 minutes", "Too many attempts, please try again later"),
    },
    schemas: {
      Error: {
        type: "object",
        required: ["error"],
        properties: { error: { type: "string" } },
      },
      SignupRequest: {
        type: "object",
        required: ["email", "pnum", "password"],
        properties: {
          email: { type: "string", format: "email" },
          pnum: { type: "string", pattern: "^\\d{10}$", description: "10 digit phone number" },
          password: { type: "string", minLength: 8, maxLength: 72 },
        },
      },
      NewUser: {
        type: "object",
        properties: { id: { type: "integer" }, email: { type: "string" }, pnum: { type: "string" } },
      },
      LoginRequest: {
        type: "object",
        required: ["email", "password"],
        properties: { email: { type: "string", format: "email" }, password: { type: "string" } },
      },
      LoginResponse: {
        type: "object",
        properties: { token: { type: "string" }, uid: { type: "integer" } },
      },
      Profile: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string", nullable: true },
          email: { type: "string" },
          pnum: { type: "string", nullable: true },
          address: { type: "string", nullable: true },
          is_admin: { type: "boolean" },
        },
      },
      Product: {
        type: "object",
        properties: {
          id: { type: "integer", example: 3 },
          namee: { type: "string", description: "Product name", example: "Linen Blend Casual Shirt" },
          description: { type: "string" },
          img: { type: "string", format: "uri" },
          price: { type: "integer", description: "Original price in rupees", example: 1999 },
          sellprice: { type: "integer", description: "Sale price in rupees", example: 1299 },
          gender: { type: "string", enum: ["men", "women"] },
          category: { type: "string", example: "shirts" },
          is_bestseller: { type: "boolean" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      Bestseller: {
        type: "object",
        properties: {
          id: { type: "integer" },
          name: { type: "string" },
          description: { type: "string" },
          img: { type: "string" },
          price: { type: "integer" },
          sellprice: { type: "integer" },
          gender: { type: "string" },
          category: { type: "string" },
        },
      },
      ProductPage: {
        type: "object",
        properties: {
          products: { type: "array", items: { $ref: "#/components/schemas/Product" } },
          total: { type: "integer", example: 35 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 12 },
          totalPages: { type: "integer", example: 3 },
        },
      },
      ProductInput: {
        type: "object",
        required: ["namee", "img", "price", "sellprice", "gender", "category"],
        properties: {
          namee: { type: "string", minLength: 2, maxLength: 255 },
          description: { type: "string", maxLength: 2000 },
          img: { type: "string", format: "uri" },
          price: { type: "integer", minimum: 1 },
          sellprice: { type: "integer", minimum: 1, description: "Cannot be more than `price`" },
          gender: { type: "string", enum: ["men", "women"] },
          category: { type: "string", pattern: "^[a-z0-9-]{2,50}$" },
          is_bestseller: { type: "boolean", default: false },
        },
        example: {
          namee: "Festive Silk Saree",
          description: "Handwoven silk saree with zari border.",
          img: "https://placehold.co/400x500?text=Saree",
          price: 4999,
          sellprice: 3499,
          gender: "women",
          category: "sarees",
          is_bestseller: false,
        },
      },
      AddToCartRequest: {
        type: "object",
        required: ["pid", "count"],
        properties: {
          pid: { type: "integer", description: "Product id" },
          count: { type: "integer", minimum: 1, maximum: 10 },
        },
      },
      CartItem: {
        type: "object",
        properties: {
          id: { type: "integer", description: "Cart item id" },
          product_id: { type: "integer" },
          quantity: { type: "integer" },
          namee: { type: "string" },
          description: { type: "string" },
          img: { type: "string" },
          price: { type: "integer" },
          sellprice: { type: "integer" },
          gender: { type: "string" },
          category: { type: "string" },
        },
      },
      Shipping: {
        type: "object",
        required: ["name", "phone", "address", "city", "pincode"],
        properties: {
          name: { type: "string", minLength: 2, maxLength: 100 },
          phone: { type: "string", pattern: "^\\d{10}$" },
          address: { type: "string", minLength: 5, maxLength: 255 },
          city: { type: "string", minLength: 2, maxLength: 100 },
          pincode: { type: "string", pattern: "^\\d{6}$" },
        },
      },
      OrderStatus: { type: "string", enum: ["placed", "shipped", "delivered", "cancelled"] },
      PaymentStatus: { type: "string", enum: ["pending", "paid", "failed", "cod"] },
      OrderSummary: {
        type: "object",
        properties: {
          id: { type: "integer" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          payment_status: { $ref: "#/components/schemas/PaymentStatus" },
          total: { type: "integer" },
          item_count: { type: "integer" },
          img: { type: "string", nullable: true, description: "Image of the first item" },
          created_at: { type: "string", format: "date-time" },
        },
      },
      OrderDetail: {
        type: "object",
        properties: {
          id: { type: "integer" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          total: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          ship_name: { type: "string", nullable: true },
          ship_phone: { type: "string", nullable: true },
          ship_address: { type: "string", nullable: true },
          ship_city: { type: "string", nullable: true },
          ship_pincode: { type: "string", nullable: true },
          payment_method: { type: "string", enum: ["card", "upi", "cod"], nullable: true },
          payment_status: { $ref: "#/components/schemas/PaymentStatus" },
          transaction_id: { type: "string", nullable: true },
          paid_at: { type: "string", format: "date-time", nullable: true },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                product_id: { type: "integer", nullable: true, description: "null if the product was deleted" },
                product_name: { type: "string" },
                img: { type: "string" },
                price: { type: "integer", description: "Price paid per item" },
                quantity: { type: "integer" },
              },
            },
          },
          last_payment: {
            type: "object",
            nullable: true,
            properties: {
              card_brand: { type: "string", nullable: true },
              card_last4: { type: "string", nullable: true },
              upi_id: { type: "string", nullable: true },
              failure_reason: { type: "string", nullable: true },
            },
          },
        },
      },
      PaymentRequest: {
        oneOf: [
          {
            type: "object",
            required: ["method", "card"],
            properties: {
              method: { type: "string", enum: ["card"] },
              card: {
                type: "object",
                required: ["number", "name", "expiry", "cvv"],
                properties: {
                  number: { type: "string", description: "Spaces and dashes are allowed" },
                  name: { type: "string" },
                  expiry: { type: "string", pattern: "^(0[1-9]|1[0-2])/\\d{2}$", example: "12/30" },
                  cvv: { type: "string", pattern: "^\\d{3,4}$" },
                },
              },
            },
          },
          {
            type: "object",
            required: ["method", "upiId"],
            properties: {
              method: { type: "string", enum: ["upi"] },
              upiId: { type: "string", example: "demo@okaxis" },
            },
          },
          {
            type: "object",
            required: ["method"],
            properties: { method: { type: "string", enum: ["cod"] } },
          },
        ],
        discriminator: { propertyName: "method" },
      },
      AdminOrder: {
        type: "object",
        properties: {
          id: { type: "integer" },
          status: { $ref: "#/components/schemas/OrderStatus" },
          payment_status: { $ref: "#/components/schemas/PaymentStatus" },
          payment_method: { type: "string", nullable: true },
          total: { type: "integer" },
          created_at: { type: "string", format: "date-time" },
          ship_name: { type: "string", nullable: true },
          ship_city: { type: "string", nullable: true },
          email: { type: "string" },
          items: { type: "string", example: "Linen Blend Casual Shirt x2, Polo T-Shirt x1" },
        },
      },
      Stats: {
        type: "object",
        properties: {
          revenue: { type: "integer" },
          orders: { type: "integer" },
          orders_to_ship: { type: "integer" },
          customers: { type: "integer" },
          products: { type: "integer" },
          daily: {
            type: "array",
            description: "One entry per day for the last 30 days",
            items: {
              type: "object",
              properties: {
                day: { type: "string", format: "date" },
                revenue: { type: "integer" },
                orders: { type: "integer" },
              },
            },
          },
          topProducts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                product_id: { type: "integer", nullable: true },
                name: { type: "string" },
                sold: { type: "integer" },
                revenue: { type: "integer" },
              },
            },
          },
          recentOrders: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "integer" },
                total: { type: "integer" },
                status: { $ref: "#/components/schemas/OrderStatus" },
                payment_status: { $ref: "#/components/schemas/PaymentStatus" },
                created_at: { type: "string", format: "date-time" },
                email: { type: "string" },
              },
            },
          },
        },
      },
    },
  },
};

export default openapi;
