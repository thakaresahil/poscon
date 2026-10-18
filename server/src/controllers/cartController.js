import db from "../config/db.js";

export const getCart = async (req, res) => {
  const cartdata = await db.query(
    `SELECT cart.id, cart.product_id, cart.quantity, cart.size, products.namee, products.description,
            products.img, products.price, products.sellprice, products.gender, products.category
     FROM cart INNER JOIN products ON cart.product_id = products.id
     WHERE cart.user_id = $1
     ORDER BY cart.created_at`,
    [req.user.id]
  );
  res.json(cartdata.rows);
};

const MAX_QUANTITY = 10;

export const addToCart = async (req, res) => {
  const { pid, count, size } = req.body;
  const product = await db.query("SELECT sizes FROM products WHERE id = $1", [pid]);
  if (product.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  const { sizes } = product.rows[0];
  if (sizes.length > 0 && !sizes.includes(size)) {
    return res.status(400).json({ error: size ? `Size ${size} is not available for this product` : "Please choose a size" });
  }
  if (sizes.length === 0 && size) {
    return res.status(400).json({ error: "This product does not come in sizes" });
  }
  try {
    // Adding a product that is already in the cart increases its quantity
    const result = await db.query(
      `INSERT INTO cart (user_id, product_id, quantity, size) VALUES ($1, $2, $3, $5)
       ON CONFLICT (user_id, product_id, size)
       DO UPDATE SET quantity = LEAST(cart.quantity + EXCLUDED.quantity, $4)
       RETURNING id, product_id, quantity, size`,
      [req.user.id, pid, count, MAX_QUANTITY, size]
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
     WHERE id = $2 AND user_id = $3
     RETURNING id, product_id, quantity, size`,
    [req.body.quantity, req.params.id, req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  res.json(result.rows[0]);
};

export const removeCartItem = async (req, res) => {
  const result = await db.query(
    "DELETE FROM cart WHERE id = $1 AND user_id = $2",
    [req.params.id, req.user.id]
  );
  if (result.rowCount === 0) {
    return res.status(404).json({ error: "Cart item not found" });
  }
  res.status(204).end();
};
