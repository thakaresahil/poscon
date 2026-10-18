import db, { withTransaction } from "../config/db.js";

class EmptyCartError extends Error {}

export const placeOrder = async (req, res) => {
  const { name, phone, address, city, pincode } = req.body;
  try {
    const order = await withTransaction(async (client) => {
      // Lock the cart rows so a double click cannot order the same items twice
      const cart = await client.query(
        `SELECT cart.product_id, cart.quantity, products.namee, products.img, products.sellprice
         FROM cart JOIN products ON products.id = cart.product_id
         WHERE cart.user_id = $1
         ORDER BY cart.created_at
         FOR UPDATE OF cart`,
        [req.user.id]
      );
      if (cart.rowCount === 0) {
        throw new EmptyCartError();
      }

      const total = cart.rows.reduce(
        (sum, item) => sum + item.sellprice * item.quantity,
        0
      );
      const created = await client.query(
        `INSERT INTO orders (user_id, total, ship_name, ship_phone, ship_address, ship_city, ship_pincode)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, status, total, created_at`,
        [req.user.id, total, name, phone, address, city, pincode]
      );
      const orderId = created.rows[0].id;

      for (const item of cart.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, img, price, quantity)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [orderId, item.product_id, item.namee, item.img, item.sellprice, item.quantity]
        );
      }
      await client.query("DELETE FROM cart WHERE user_id = $1", [req.user.id]);

      return created.rows[0];
    });
    res.status(201).json(order);
  } catch (error) {
    if (error instanceof EmptyCartError) {
      return res.status(400).json({ error: "Your cart is empty" });
    }
    throw error;
  }
};

export const getOrders = async (req, res) => {
  const orders = await db.query(
    `SELECT orders.id, orders.status, orders.total, orders.created_at,
            COALESCE(SUM(order_items.quantity), 0)::int AS item_count,
            (ARRAY_AGG(order_items.img ORDER BY order_items.id))[1] AS img
     FROM orders LEFT JOIN order_items ON order_items.order_id = orders.id
     WHERE orders.user_id = $1
     GROUP BY orders.id
     ORDER BY orders.created_at DESC`,
    [req.user.id]
  );
  res.json(orders.rows);
};

export const getOrderById = async (req, res) => {
  const order = await db.query(
    `SELECT id, status, total, created_at, ship_name, ship_phone, ship_address, ship_city, ship_pincode
     FROM orders WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (order.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }
  const items = await db.query(
    `SELECT id, product_id, product_name, img, price, quantity
     FROM order_items WHERE order_id = $1 ORDER BY id`,
    [req.params.id]
  );
  res.json({ ...order.rows[0], items: items.rows });
};
