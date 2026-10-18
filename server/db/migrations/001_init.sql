CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255),
  email VARCHAR(255) NOT NULL UNIQUE,
  pnum VARCHAR(15) UNIQUE,
  passhash TEXT NOT NULL,
  address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE products (
  id SERIAL PRIMARY KEY,
  namee VARCHAR(255) NOT NULL,
  description TEXT NOT NULL DEFAULT '',
  img TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  sellprice INTEGER NOT NULL CHECK (sellprice >= 0),
  gender VARCHAR(10) NOT NULL CHECK (gender IN ('men', 'women')),
  category VARCHAR(50) NOT NULL,
  is_bestseller BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX products_gender_category_idx ON products (gender, category);

-- status: 0 = in cart, 1 = purchased
CREATE TABLE cart (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  product_id INTEGER NOT NULL REFERENCES products (id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
  status SMALLINT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX cart_user_status_idx ON cart (user_id, status);

CREATE VIEW bestseller AS
  SELECT id, namee AS name, description, img, price, sellprice, gender, category
  FROM products
  WHERE is_bestseller;
