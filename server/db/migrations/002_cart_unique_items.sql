-- Merge duplicate in-cart rows for the same product into one row
UPDATE cart AS keep
SET quantity = LEAST(merged.total, 10)
FROM (
  SELECT MIN(id) AS id, SUM(quantity) AS total
  FROM cart
  WHERE status = 0
  GROUP BY user_id, product_id
  HAVING COUNT(*) > 1
) AS merged
WHERE keep.id = merged.id;

DELETE FROM cart AS dup
USING cart AS keep
WHERE dup.status = 0
  AND keep.status = 0
  AND dup.user_id = keep.user_id
  AND dup.product_id = keep.product_id
  AND dup.id > keep.id;

ALTER TABLE cart ADD CONSTRAINT cart_quantity_max CHECK (quantity <= 10);

-- A product can only appear once in a user's active cart
CREATE UNIQUE INDEX cart_active_item_idx ON cart (user_id, product_id) WHERE status = 0;
