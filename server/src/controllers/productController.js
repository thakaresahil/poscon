import db from "../config/db.js";

const categoryQueries = {
  women: "SELECT * FROM products WHERE gender = 'women' ORDER BY RANDOM() LIMIT 36",
  men: "SELECT * FROM products WHERE gender = 'men' AND category != 'accessories' ORDER BY RANDOM() LIMIT 36",
  access: "SELECT * FROM products WHERE category = 'accessories' ORDER BY RANDOM() LIMIT 36",
  newarrivals: "SELECT * FROM products LIMIT 36",
};

export const getLatestProducts = async (req, res) => {
  const products = await db.query("SELECT * FROM products LIMIT 8");
  res.json(products.rows);
};

export const getBestsellers = async (req, res) => {
  const bestseller = await db.query("SELECT * FROM bestseller");
  res.json(bestseller.rows);
};

export const getProductsByCategory = async (req, res) => {
  const query = categoryQueries[req.params.category];
  if (!query) {
    return res.status(404).json({ error: "Category not found" });
  }
  const products = await db.query(query);
  res.json(products.rows);
};

export const getProductById = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  const product = await db.query("SELECT * FROM products WHERE id = $1", [id]);
  if (product.rowCount === 0) {
    return res.status(404).json({ error: "Product not found" });
  }
  res.json(product.rows[0]);
};
