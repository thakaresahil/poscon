import express from "express";
import pg from "pg";
import env from "dotenv";
import path from "path";
import cors from "cors";
import bodyParser from "body-parser";
import multer from "multer";
import fs from "fs";
import util from "util";
import bcrypt from "bcrypt";
import { generateToken, verifyToken } from "./auth.js";

const app = express();
const port = 9000;
const saltRounds = 10;
app.use(cors());

env.config();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static("public"));

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

const unlinkAsync = util.promisify(fs.unlink);

const profstorage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, "./public/profimg");
  },
  filename: function (req, file, cb) {
    return cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});

async function deleteFile(filePath) {
  try {
    await unlinkAsync(filePath);
    console.log(`Successfully deleted ${filePath}`);
  } catch (error) {
    console.error(`Error deleting ${filePath}:`, error);
  }
}

const authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"];
  if (!token) return res.sendStatus(401);

  const verifiedUser = verifyToken(token);
  if (!verifiedUser) return res.sendStatus(403);

  req.user = verifiedUser;
  next();
};

app.get("/data", async (req, res) => {
  try {
    const dataretrive = await db.query("SELECT * FROM mytable LIMIT 8");
    return res.json(dataretrive.rows).end();
    // console.log(dataretrive);
  } catch (err) {
    console.error(err);
    return res.json({ error: "Internal Server Error" });
  }
});

app.get("/home/bestseller", async (req, res) => {
  try {
    const bestseller = await db.query("SELECT * FROM bestseller");
    return res.json(bestseller.rows).end();
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/women", async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM mytable ORDER BY RANDOM() LIMIT 36"
    );
    return res.json(products.rows).end();
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/newarrivals", async (req, res) => {
  try {
    const products = await db.query("SELECT * FROM mytable LIMIT 36");
    return res.json(products.rows).end();
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/men", async (req, res) => {
  try {
    const products = await db.query(
      "SELECT * FROM men WHERE CATEGORY != 'accessories' ORDER BY RANDOM() LIMIT 36"
    );
    return res.json(products.rows).end();
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.get("/browseproducts/access", async (req, res) => {
  const access = req.params.access;
  try {
    const products = await db.query(
      "SELECT * FROM men WHERE category = 'accessories' ORDER BY RANDOM() LIMIT 36"
    );
    return res.json(products.rows).end();
  } catch (error) {
    console.error(error);
    return res.json({ error: "Internal Server Error" });
  }
});

app.post("/signup/user", async (req, res) => {
  const phonenumber = req.body.phonenumber;
  const email = req.body.email;
  const password = req.body.password;

  //const hashPassword = await bcrypt.hash(password, saltRounds);

  try {
    const isUser = await db.query("SELECT * FROM users WHERE email_id = $1", [
      email,
    ]);

    if (isUser.rowCount > 0) {
      console.log("User already exists");
      return res.json({ error: "User already exists" });
    } else {
      const result = await db.query(
        "INSERT INTO usersdata (mobilenumber, emailid, passwordhash) VALUES ($1, $2, $3) RETURNING *",
        [phonenumber, email, password]
      );
      console.log(result);
      const user = result.rows[0];
      res.status(201).json(user);
    }
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await db.query("SELECT * FROM users WHERE email_id = $1", [
      email,
    ]);
    const user = result.rows[0];
    if (user && (await bcrypt.compare(password, user.password_hash))) {
      const token = generateToken(user);
      res.json({ token });
    } else {
      res.json({ error: "Invalid credentials" });
    }
  } catch (error) {
    res.status(500).json({ error: error.meggase });
  }
});

app.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: "Thie is a protected route", user: req.user });
});

app.listen(port, () => {
  console.log(`Server running on port http://localhost:${port}`);
});
