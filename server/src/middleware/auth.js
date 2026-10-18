import jwt from "jsonwebtoken";
import db from "../config/db.js";
import { config } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, config.sessionSecret, { expiresIn: "7d" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.sessionSecret);
  } catch {
    return null;
  }
};

export const authenticateToken = (req, res, next) => {
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

// Checked against the database on every request so removing admin access takes effect immediately
export const requireAdmin = async (req, res, next) => {
  try {
    const result = await db.query("SELECT is_admin FROM users WHERE id = $1", [req.user.id]);
    if (!result.rows[0]?.is_admin) {
      return res.status(403).json({ error: "Admin access required" });
    }
    next();
  } catch (error) {
    next(error);
  }
};
