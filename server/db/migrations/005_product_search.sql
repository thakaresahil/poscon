-- Trigram index so ILIKE searches on product text stay fast as the catalogue grows
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX products_search_idx ON products
  USING GIN ((namee || ' ' || description || ' ' || category) gin_trgm_ops);

CREATE INDEX products_sellprice_idx ON products (sellprice);
CREATE INDEX products_created_at_idx ON products (created_at DESC);
CREATE INDEX order_items_product_idx ON order_items (product_id);
