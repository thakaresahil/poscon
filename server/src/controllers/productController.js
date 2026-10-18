import db from "../config/db.js";

const sortOrders = {
  newest: "products.created_at DESC, products.id DESC",
  popular: "COALESCE(sales.sold, 0) DESC, products.id",
  price_asc: "products.sellprice ASC, products.id",
  price_desc: "products.sellprice DESC, products.id",
  discount: "(products.price - products.sellprice)::float / NULLIF(products.price, 0) DESC, products.id",
};

// Escape LIKE wildcards so a search for "50%" matches the text literally
const escapeLike = (value) => value.replace(/[\\%_]/g, (char) => `\\${char}`);

export const searchProducts = async (req, res) => {
  const { q, gender, category, minPrice, maxPrice, sort, page, limit } = req.query;
  const conditions = [];
  const params = [];
  const addParam = (value) => {
    params.push(value);
    return `$${params.length}`;
  };

  if (q) {
    conditions.push(
      `(products.namee || ' ' || products.description || ' ' || products.category) ILIKE ${addParam(`%${escapeLike(q)}%`)}`
    );
  }
  if (gender) {
    conditions.push(`products.gender = ${addParam(gender)}`);
  }
  if (category) {
    conditions.push(`products.category = ${addParam(category)}`);
  }
  if (minPrice !== undefined) {
    conditions.push(`products.sellprice >= ${addParam(minPrice)}`);
  }
  if (maxPrice !== undefined) {
    conditions.push(`products.sellprice <= ${addParam(maxPrice)}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const filterParams = [...params];
  const offset = (page - 1) * limit;

  const [rows, count] = await Promise.all([
    db.query(
      `SELECT products.*
       FROM products
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS sold FROM order_items GROUP BY product_id
       ) AS sales ON sales.product_id = products.id
       ${where}
       ORDER BY ${sortOrders[sort]}
       LIMIT ${addParam(limit)} OFFSET ${addParam(offset)}`,
      params
    ),
    db.query(`SELECT COUNT(*)::int AS total FROM products ${where}`, filterParams),
  ]);

  const total = count.rows[0].total;
  res.json({
    products: rows.rows,
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  });
};

export const getCategories = async (req, res) => {
  const categories = await db.query(
    `SELECT category, COUNT(*)::int AS count
     FROM products
     GROUP BY category
     ORDER BY category`
  );
  res.json(categories.rows);
};

export const getLatestProducts = async (req, res) => {
  const products = await db.query(
    "SELECT * FROM products ORDER BY created_at DESC, id DESC LIMIT 8"
  );
  res.json(products.rows);
};

export const getBestsellers = async (req, res) => {
  const bestseller = await db.query("SELECT * FROM bestseller");
  res.json(bestseller.rows);
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
