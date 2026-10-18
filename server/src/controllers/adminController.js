import db from "../config/db.js";

// Orders that count as revenue: paid online or cash on delivery, and not cancelled
const REVENUE_FILTER =
  "orders.payment_status IN ('paid', 'cod') AND orders.status <> 'cancelled'";

// Which status an order can move to from its current status
const allowedTransitions = {
  placed: ["shipped", "cancelled"],
  shipped: ["delivered", "cancelled"],
  delivered: [],
  cancelled: [],
};

export const getStats = async (req, res) => {
  const [totals, daily, topProducts, recentOrders] = await Promise.all([
    db.query(
      `SELECT
         (SELECT COALESCE(SUM(total), 0)::int FROM orders WHERE ${REVENUE_FILTER}) AS revenue,
         (SELECT COUNT(*)::int FROM orders) AS orders,
         (SELECT COUNT(*)::int FROM orders WHERE status = 'placed') AS orders_to_ship,
         (SELECT COUNT(*)::int FROM users WHERE NOT is_admin) AS customers,
         (SELECT COUNT(*)::int FROM products) AS products`
    ),
    db.query(
      `SELECT TO_CHAR(day, 'YYYY-MM-DD') AS day,
              COALESCE(SUM(orders.total), 0)::int AS revenue,
              COUNT(orders.id)::int AS orders
       FROM GENERATE_SERIES(CURRENT_DATE - 29, CURRENT_DATE, INTERVAL '1 day') AS day
       LEFT JOIN orders ON DATE(orders.created_at) = day AND ${REVENUE_FILTER}
       GROUP BY day
       ORDER BY day`
    ),
    db.query(
      `SELECT order_items.product_id, MAX(order_items.product_name) AS name,
              SUM(order_items.quantity)::int AS sold,
              SUM(order_items.price * order_items.quantity)::int AS revenue
       FROM order_items JOIN orders ON orders.id = order_items.order_id
       WHERE ${REVENUE_FILTER}
       GROUP BY order_items.product_id
       ORDER BY sold DESC, revenue DESC
       LIMIT 5`
    ),
    db.query(
      `SELECT orders.id, orders.total, orders.status, orders.payment_status, orders.created_at, users.email
       FROM orders JOIN users ON users.id = orders.user_id
       ORDER BY orders.created_at DESC
       LIMIT 5`
    ),
  ]);

  res.json({
    ...totals.rows[0],
    daily: daily.rows,
    topProducts: topProducts.rows,
    recentOrders: recentOrders.rows,
  });
};

export const getAllOrders = async (req, res) => {
  const { status, page, limit } = req.query;
  const params = status ? [status] : [];
  const where = status ? "WHERE orders.status = $1" : "";

  const [rows, count] = await Promise.all([
    db.query(
      `SELECT orders.id, orders.status, orders.payment_status, orders.payment_method, orders.total,
              orders.created_at, orders.ship_name, orders.ship_city, users.email,
              STRING_AGG(order_items.product_name || ' x' || order_items.quantity, ', ' ORDER BY order_items.id) AS items
       FROM orders
       JOIN users ON users.id = orders.user_id
       LEFT JOIN order_items ON order_items.order_id = orders.id
       ${where}
       GROUP BY orders.id, users.email
       ORDER BY orders.created_at DESC, orders.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      [...params, limit, (page - 1) * limit]
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM orders ${where}`, params),
  ]);

  const total = count.rows[0].total;
  res.json({
    orders: rows.rows,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
};

export const updateOrderStatus = async (req, res) => {
  const { status } = req.body;
  const current = await db.query("SELECT status FROM orders WHERE id = $1", [req.params.id]);
  if (current.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }

  const from = current.rows[0].status;
  if (!allowedTransitions[from].includes(status)) {
    return res
      .status(409)
      .json({ error: `An order that is ${from} cannot be marked as ${status}` });
  }

  // Only update if the status has not changed since it was read
  const updated = await db.query(
    "UPDATE orders SET status = $1 WHERE id = $2 AND status = $3 RETURNING id, status",
    [status, req.params.id, from]
  );
  if (updated.rowCount === 0) {
    return res.status(409).json({ error: "The order was updated by someone else, please refresh" });
  }
  res.json(updated.rows[0]);
};

const productColumns = [
  "namee",
  "description",
  "img",
  "price",
  "sellprice",
  "gender",
  "category",
  "is_bestseller",
];

export const createProduct = async (req, res) => {
  const values = productColumns.map((column) => req.body[column]);
  const created = await db.query(
    `INSERT INTO products (${productColumns.join(", ")})
     VALUES (${productColumns.map((_, index) => `$${index + 1}`).join(", ")})
     RETURNING *`,
    values
  );
  res.status(201).json(created.rows[0]);
};

export const updateProduct = async (req, res) => {
  const values = productColumns.map((column) => req.body[column]);
  const updated = await db.query(
    `UPDATE products
     SET ${productColumns.map((column, index) => `${column} = $${index + 1}`).join(", ")}
     WHERE id = $${productColumns.length + 1}
     RETURNING *`,
    [...values, req.params.id]
  );
  if (updated.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(updated.rows[0]);
};

// Past orders keep their own copy of the name, image and price, so deleting is safe
export const deleteProduct = async (req, res) => {
  const deleted = await db.query("DELETE FROM products WHERE id = $1", [req.params.id]);
  if (deleted.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.status(204).end();
};
