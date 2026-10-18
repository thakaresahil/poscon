import jwt from "jsonwebtoken";
import { config } from "../config/env.js";

export const generateToken = (user) => {
  return jwt.sign({ id: user.id }, config.sessionSecret, { expiresIn: "7d" });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, config.sessionSecret);
  } catch (err) {
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
