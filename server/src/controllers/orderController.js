import db, { withTransaction } from "../config/db.js";
import { chargePayment, getCardBrand } from "../utils/mockPayment.js";

class EmptyCartError extends Error {}

export const placeOrder = async (req, res) => {
  const { name, phone, address, city, pincode } = req.body;
  try {
    const order = await withTransaction(async (client) => {
      // Lock the cart rows so a double click cannot order the same items twice
      const cart = await client.query(
        `SELECT cart.product_id, cart.quantity, cart.size, products.namee, products.img, products.sellprice
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
         RETURNING id, status, total, payment_status, created_at`,
        [req.user.id, total, name, phone, address, city, pincode]
      );
      const orderId = created.rows[0].id;

      for (const item of cart.rows) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, img, price, quantity, size)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [orderId, item.product_id, item.namee, item.img, item.sellprice, item.quantity, item.size]
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
    `SELECT orders.id, orders.status, orders.total, orders.payment_status, orders.created_at,
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
    `SELECT id, status, total, created_at, ship_name, ship_phone, ship_address, ship_city, ship_pincode,
            payment_method, payment_status, transaction_id, paid_at
     FROM orders WHERE id = $1 AND user_id = $2`,
    [req.params.id, req.user.id]
  );
  if (order.rowCount === 0) {
    return res.status(404).json({ error: "Order not found" });
  }
  const items = await db.query(
    `SELECT id, product_id, product_name, img, price, quantity, size
     FROM order_items WHERE order_id = $1 ORDER BY id`,
    [req.params.id]
  );
  const payment = await db.query(
    `SELECT card_brand, card_last4, upi_id, failure_reason
     FROM payments WHERE order_id = $1 ORDER BY created_at DESC, id DESC LIMIT 1`,
    [req.params.id]
  );
  res.json({ ...order.rows[0], items: items.rows, last_payment: payment.rows[0] || null });
};

class PaymentNotAllowedError extends Error {}

export const payOrder = async (req, res) => {
  const { method, card, upiId } = req.body;
  try {
    const result = await withTransaction(async (client) => {
      // Lock the order so two payment attempts cannot both succeed
      const found = await client.query(
        "SELECT id, total, payment_status FROM orders WHERE id = $1 AND user_id = $2 FOR UPDATE",
        [req.params.id, req.user.id]
      );
      if (found.rowCount === 0) {
        return null;
      }
      const order = found.rows[0];
      if (!["pending", "failed"].includes(order.payment_status)) {
        throw new PaymentNotAllowedError();
      }

      const cardDetails =
        method === "card"
          ? { brand: getCardBrand(card.number), last4: card.number.slice(-4) }
          : { brand: null, last4: null };

      if (method === "cod") {
        await client.query(
          "UPDATE orders SET payment_method = 'cod', payment_status = 'cod' WHERE id = $1",
          [order.id]
        );
        return { payment_status: "cod", payment_method: "cod" };
      }

      const charge = chargePayment({ method, card, upiId });
      await client.query(
        `INSERT INTO payments (order_id, method, status, amount, transaction_id, failure_reason, card_brand, card_last4, upi_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
        [
          order.id,
          method,
          charge.success ? "success" : "failed",
          order.total,
          charge.transactionId || null,
          charge.reason || null,
          cardDetails.brand,
          cardDetails.last4,
          method === "upi" ? upiId : null,
        ]
      );

      if (!charge.success) {
        await client.query(
          "UPDATE orders SET payment_method = $1, payment_status = 'failed' WHERE id = $2",
          [method, order.id]
        );
        return { payment_status: "failed", error: charge.reason };
      }

      await client.query(
        `UPDATE orders SET payment_method = $1, payment_status = 'paid', transaction_id = $2, paid_at = NOW()
         WHERE id = $3`,
        [method, charge.transactionId, order.id]
      );
      return {
        payment_status: "paid",
        payment_method: method,
        transaction_id: charge.transactionId,
      };
    });

    if (!result) {
      return res.status(404).json({ error: "Order not found" });
    }
    if (result.payment_status === "failed") {
      return res.status(402).json(result);
    }
    res.json(result);
  } catch (error) {
    if (error instanceof PaymentNotAllowedError) {
      return res.status(409).json({ error: "Payment for this order is already complete" });
    }
    throw error;
  }
};
