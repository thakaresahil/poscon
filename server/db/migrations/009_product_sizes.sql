-- Sizes a product comes in; an empty list means one size (e.g. accessories)
ALTER TABLE products ADD COLUMN sizes TEXT[] NOT NULL DEFAULT '{}';

UPDATE products SET sizes = ARRAY['XS', 'S', 'M', 'L', 'XL']
WHERE category IN ('shirts', 't-shirts', 'tops', 'dresses', 'kurtas', 'winterwear');

UPDATE products SET sizes = ARRAY['28', '30', '32', '34', '36']
WHERE category IN ('jeans', 'trousers');

-- The chosen size is part of each cart and order item. '' means the product has no sizes.
ALTER TABLE cart ADD COLUMN size VARCHAR(10) NOT NULL DEFAULT '';
ALTER TABLE cart DROP CONSTRAINT cart_user_product_unique;
ALTER TABLE cart ADD CONSTRAINT cart_user_product_size_unique UNIQUE (user_id, product_id, size);

ALTER TABLE order_items ADD COLUMN size VARCHAR(10) NOT NULL DEFAULT '';
