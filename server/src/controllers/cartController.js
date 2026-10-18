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

export const addToCart = async (req, res) => {
  const { pid, count } = req.body;
  try {
    await db.query(
      "INSERT INTO cart (user_id, product_id, quantity) VALUES ($1, $2, $3)",
      [req.user.id, pid, count]
    );
    res.status(201).json({ status: "Added" });
  } catch (error) {
    if (error.code === "23503") {
      return res.status(404).json({ error: "Product not found" });
    }
    throw error;
  }
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
