import db from "../config/db.js";

export const sendMessage = async (req, res) => {
  const { name, email, subject, message } = req.body;
  const created = await db.query(
    `INSERT INTO contact_messages (name, email, subject, message)
     VALUES ($1, $2, $3, $4)
     RETURNING id, created_at`,
    [name, email, subject, message]
  );
  res.status(201).json({ status: "Sent", ...created.rows[0] });
};

export const getMessages = async (req, res) => {
  const { status, page, limit } = req.query;
  const params = status ? [status] : [];
  const where = status ? "WHERE status = $1" : "";

  const [rows, count, unread] = await Promise.all([
    db.query(
      `SELECT id, name, email, subject, message, status, created_at
       FROM contact_messages ${where}
       ORDER BY created_at DESC, id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM contact_messages ${where}`, params),
    db.query("SELECT COUNT(*)::int AS total FROM contact_messages WHERE status = 'new'"),
  ]);

  const total = count.rows[0].total;
  res.json({
    messages: rows.rows,
    total,
    unread: unread.rows[0].total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
};

export const updateMessageStatus = async (req, res) => {
  const updated = await db.query(
    "UPDATE contact_messages SET status = $1 WHERE id = $2 RETURNING id, status",
    [req.body.status, req.params.id]
  );
  if (updated.rowCount === 0) {
    return res.status(404).json({ error: "Message not found" });
  }
  res.json(updated.rows[0]);
};
