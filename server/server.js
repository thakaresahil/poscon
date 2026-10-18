import express from "express";
import pg from "pg";
import env from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { z } from "zod";

env.config();

const app = express();
const port = process.env.PORT || 9000;
const saltRounds = 10;
const secretKey = process.env.SESSION_SECRET;

if (!secretKey) {
  console.error("SESSION_SECRET is not set");
  process.exit(1);
}

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim());

app.use(helmet());
app.use(cors({ origin: allowedOrigins }));

app.use(bodyParser.json({ limit: "10kb" }));
app.use(bodyParser.urlencoded({ extended: true }));

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many attempts, please try again later" },
});

const signupSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  pnum: z.string().trim().regex(/^\d{10}$/, "Phone number must be 10 digits"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1).max(72),
});

const addToCartSchema = z.object({
  pid: z.coerce.number().int().positive(),
  count: z.coerce.number().int().min(1).max(10),
});

const buyItemSchema = z.object({
  pid: z.array(z.coerce.number().int().positive()).min(1),
});

const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    return res
      .status(400)
      .json({ error: result.error.issues[0]?.message || "Invalid input" });
  }
  req.body = result.data;
  next();
};

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const generateToken = (user) => {
  return jwt.sign({ id: user.id }, secretKey, { expiresIn: "7d" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch (err) {
    return null;
  }
};

const authenticateToken = (req, res, next) => {
  const [scheme, token] = (req.headers.authorization || "").split(" ");
  if (scheme !== "Bearer" || !token) {
    return res.status(401).json({ error: "Please log in" });
  }

  const verifiedUser = verifyToken(token);
  if (!verifiedUser) {
    return res.status(401).json({ error: "Session expired, please log in again" });
  }

  req.user = verifiedUser;
  next();
};

app.get("/data", async (req, res) => {
  try {
    const dataretrive = await db.query("SELECT * FROM products LIMIT 8");
    return res.json(dataretrive.rows);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/home/bestseller", async (req, res) => {
  try {
    const bestseller = await db.query("SELECT * FROM bestseller");
    return res.json(bestseller.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/women", async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM products WHERE gender = 'women' ORDER BY RANDOM() LIMIT 36"
    );
    return res.json(products.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/newarrivals", async (req, res) => {
  try {
    const products = await db.query("SELECT * FROM products LIMIT 36");
    return res.json(products.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/men", async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM products WHERE gender = 'men' and category !='accessories' ORDER BY RANDOM() LIMIT 36"
    );
    return res.json(products.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/access", async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM products WHERE category = 'accessories' ORDER BY RANDOM() LIMIT 36"
    );
    return res.json(products.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/profile", authenticateToken, async (req, res) => {
  try {
    const udata = await db.query(
      "SELECT id, name, email, pnum, address FROM users WHERE id = $1",
      [req.user.id]
    );
    if (udata.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.json(udata.rows[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("/cartdata", authenticateToken, async (req, res) => {
  try {
    const cartdata = await db.query(
      `SELECT cart.id, cart.product_id, cart.quantity, products.namee, products.description,
              products.img, products.price, products.sellprice, products.gender, products.category
       FROM cart INNER JOIN products ON cart.product_id = products.id
       WHERE cart.user_id = $1 AND cart.status = 0
       ORDER BY cart.created_at`,
      [req.user.id]
    );
    return res.json(cartdata.rows);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.patch("/buyitem", authenticateToken, validate(buyItemSchema), async (req, res) => {
  const { pid } = req.body;
  try {
    const result = await db.query(
      "UPDATE cart SET status = 1 WHERE user_id = $1 AND status = 0 AND product_id = ANY($2::int[])",
      [req.user.id, pid]
    );

    if (result.rowCount > 0) {
      return res.json({ status: "buyed" });
    } else {
      return res.status(404).json({ error: "Cart is empty" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

app.post("/signup/user", authLimiter, validate(signupSchema), async (req, res) => {
  const { email, pnum, password } = req.body;
  try {
    const isUser = await db.query(
      "SELECT id FROM users WHERE email = $1 OR pnum = $2",
      [email, pnum]
    );
    if (isUser.rowCount > 0) {
      return res.status(409).json({ error: "User already exists" });
    }

    const hashPassword = await bcrypt.hash(password, saltRounds);
    const result = await db.query(
      "INSERT INTO users (pnum, email, passhash) VALUES ($1, $2, $3) RETURNING id, email, pnum",
      [pnum, email, hashPassword]
    );
    return res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "User already exists" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/addtocart", authenticateToken, validate(addToCartSchema), async (req, res) => {
  const { pid, count } = req.body;
  try {
    await db.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
      [req.user.id, pid, count]
    );
    return res.status(201).json({ status: "Added" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(404).json({ error: "Product not found" });
    }
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", authLimiter, validate(loginSchema), async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query(
      "SELECT id, passhash FROM users WHERE email = $1",
      [email]
    );
    const user = result.rows[0];

    if (user && (await bcrypt.compare(password, user.passhash))) {
      const token = generateToken(user);
      return res.json({ token, uid: user.id });
    }
    return res.status(401).json({ error: "Invalid email or password" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
