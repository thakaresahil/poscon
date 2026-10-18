ALTER TABLE orders
  ADD COLUMN payment_method VARCHAR(10)
    CHECK (payment_method IN ('card', 'upi', 'cod')),
  ADD COLUMN payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'paid', 'failed', 'cod')),
  ADD COLUMN transaction_id VARCHAR(40),
  ADD COLUMN paid_at TIMESTAMPTZ;

-- Orders placed before payments existed are treated as cash on delivery
UPDATE orders SET payment_method = 'cod', payment_status = 'cod';

-- Every payment attempt, successful or not. Only the card brand and last
-- four digits are kept, never the full card number or CVV.
CREATE TABLE payments (
  id SERIAL PRIMARY KEY,
  order_id INTEGER NOT NULL REFERENCES orders (id) ON DELETE CASCADE,
  method VARCHAR(10) NOT NULL CHECK (method IN ('card', 'upi', 'cod')),
  status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed')),
  amount INTEGER NOT NULL CHECK (amount >= 0),
  transaction_id VARCHAR(40),
  failure_reason VARCHAR(255),
  card_brand VARCHAR(20),
  card_last4 VARCHAR(4),
  upi_id VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX payments_order_idx ON payments (order_id, created_at DESC);
