import db from "../config/db.js";

export const getProfile = async (req, res) => {
  const udata = await db.query(
    "SELECT id, name, email, pnum, address FROM users WHERE id = $1",
    [req.user.id]
  );
  if (udata.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(udata.rows[0]);
};
