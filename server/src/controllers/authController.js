import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../middleware/auth.js";

const saltRounds = 10;

export const signup = async (req, res) => {
  const { email, pnum, password } = req.body;
  const isUser = await db.query(
    "SELECT id FROM users WHERE email = $1 OR pnum = $2",
    [email, pnum]
  );
  if (isUser.rowCount > 0) {
    return res.status(409).json({ error: "User already exists" });
  }

  const hashPassword = await bcrypt.hash(password, saltRounds);
  try {
    const result = await db.query(
      "INSERT INTO users (pnum, email, passhash) VALUES ($1, $2, $3) RETURNING id, email, pnum",
      [pnum, email, hashPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "User already exists" });
    }
    throw error;
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  const result = await db.query(
    "SELECT id, passhash FROM users WHERE email = $1",
    [email]
  );
  const user = result.rows[0];

  if (user && (await bcrypt.compare(password, user.passhash))) {
    const token = generateToken(user);
    return res.json({ token, uid: user.id });
  }
  res.status(401).json({ error: "Invalid email or password" });
};
