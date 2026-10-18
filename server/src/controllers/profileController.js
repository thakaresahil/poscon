import bcrypt from "bcrypt";
import db from "../config/db.js";

const PROFILE_COLUMNS = "id, name, email, pnum, address, city, pincode, is_admin";

export const getProfile = async (req, res) => {
  const udata = await db.query(`SELECT ${PROFILE_COLUMNS} FROM users WHERE id = $1`, [req.user.id]);
  if (udata.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  res.json(udata.rows[0]);
};

export const updateProfile = async (req, res) => {
  const { name = null, pnum, address = null, city = null, pincode = null } = req.body;
  try {
    const updated = await db.query(
      `UPDATE users SET name = $1, pnum = $2, address = $3, city = $4, pincode = $5
       WHERE id = $6
       RETURNING ${PROFILE_COLUMNS}`,
      [name, pnum, address, city, pincode, req.user.id]
    );
    if (updated.rowCount === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(updated.rows[0]);
  } catch (error) {
    if (error.code === "23505") {
      return res.status(409).json({ error: "This phone number is already used by another account" });
    }
    throw error;
  }
};

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const user = await db.query("SELECT passhash FROM users WHERE id = $1", [req.user.id]);
  if (user.rowCount === 0) {
    return res.status(404).json({ error: "User not found" });
  }
  if (!(await bcrypt.compare(currentPassword, user.rows[0].passhash))) {
    return res.status(400).json({ error: "Current password is incorrect" });
  }
  const passhash = await bcrypt.hash(newPassword, 10);
  await db.query("UPDATE users SET passhash = $1 WHERE id = $2", [passhash, req.user.id]);
  res.json({ status: "Password changed" });
};
