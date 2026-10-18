CREATE TABLE orders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'placed'
    CHECK (status IN ('placed', 'shipped', 'delivered', 'cancelled')),
  total INTEGER NOT NULL CHECK (total >= 0),
  ship_name VARCHAR(100),
  ship_phone VARCHAR(15),
  ship_address VARCHAR(255),
  ship_city VARCHAR(100),
  ship_pincode VARCHAR(10),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX orders_user_idx ON orders (user_id, created_at DESC);

-- Name, image and price are copied at purchase time so later product changes
-- do not alter past orders
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  product_id INTEGER REFERENCES products (id) ON DELETE SET NULL,
  product_name VARCHAR(255) NOT NULL,
  img TEXT NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  quantity INTEGER NOT NULL CHECK (quantity > 0)
);

CREATE INDEX order_items_order_idx ON order_items (order_id);

-- Turn items previously marked as purchased in the cart into orders,
-- one order per user per day, then drop the old status flag
CREATE TEMP TABLE legacy_orders AS
  SELECT cart.user_id, DATE(cart.created_at) AS day,
         SUM(products.sellprice * cart.quantity) AS total,
         MIN(cart.created_at) AS created_at
  FROM cart JOIN products ON products.id = cart.product_id
  WHERE cart.status = 1
  GROUP BY cart.user_id, DATE(cart.created_at);

ALTER TABLE legacy_orders ADD COLUMN order_id INTEGER;

UPDATE legacy_orders
SET order_id = nextval(pg_get_serial_sequence('orders', 'id'));

INSERT INTO orders (id, user_id, total, created_at)
  SELECT order_id, user_id, total, created_at FROM legacy_orders;

INSERT INTO order_items (order_id, product_id, product_name, img, price, quantity)
  SELECT legacy_orders.order_id, products.id, products.namee, products.img,
         products.sellprice, cart.quantity
  FROM cart
  JOIN products ON products.id = cart.product_id
  JOIN legacy_orders ON legacy_orders.user_id = cart.user_id
   AND legacy_orders.day = DATE(cart.created_at)
  WHERE cart.status = 1;

DROP TABLE legacy_orders;

DELETE FROM cart WHERE status = 1;

-- The cart now only holds items that have not been ordered yet
DROP INDEX cart_active_item_idx;
DROP INDEX cart_user_status_idx;
ALTER TABLE cart DROP COLUMN status;
ALTER TABLE cart ADD CONSTRAINT cart_user_product_unique UNIQUE (user_id, product_id);
CREATE INDEX cart_user_idx ON cart (user_id);
