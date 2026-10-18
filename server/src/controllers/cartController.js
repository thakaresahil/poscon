import db from "../config/db.js";

export const getCart = async (req, res) => {
  const cartdata = await db.query(
    `SELECT cart.id, cart.product_id, cart.quantity, products.namee, products.description,
            products.img, products.price, products.sellprice, products.gender, products.category
     FROM cart INNER JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = $1 AND cart.status = 0
     ORDER BY cart.created_at`,
    [req.user.id]
  );
  res.json(cartdata.rows);
};

const MAX_QUANTITY = 10;

export const addToCart = async (req, res) => {
  const { pid, count } = req.body;
  try {
    // Adding a product that is already in the cart increases its quantity
    const result = await db.query(
      `INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)
       ON CONFLICT (user_id, product_id) WHERE status = 0
       DO UPDATE SET quantity = LEAST(cart.quantity + EXCLUDED.quantity, $4)
       RETURNING id, product_id, quantity`,
      [req.user.id, pid, count, MAX_QUANTITY]
    );
    res.status(201).json({ status: "Added", item: result.rows[0] });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(404).json({ error: "Product not found" });
    }
    throw error;
  }
};

export const updateCartItem = async (req, res) => {
  const result = await db.query(
    `UPDATE cart SET quantity = $1
     WHERE id = $2 AND user_id = $3 AND status = 0
     RETURNING id, product_id, quantity`,
    [req.body.quantity, req.params.id, req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  res.json(result.rows[0]);
};

export const removeCartItem = async (req, res) => {
  const result = await db.query(
    "DELETE FROM cart WHERE id = $1 AND user_id = $2 AND status = 0",
    [req.params.id, req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  res.status(204).end();
};

export const buyItems = async (req, res) => {
  const { pid } = req.body;
  const result = await db.query(
    "UPDATE cart SET status = 1 WHERE user_id = $1 AND status = 0 AND product_id = ANY($2::int[])",
    [req.user.id, pid]
  );

  if (result.rowCount > 0) {
    return res.json({ status: "buyed" });
  }
  res.status(404).json({ error: "Cart is empty" });
};
