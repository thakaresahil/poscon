-- Saved delivery address, used to fill in checkout
ALTER TABLE users
  ADD COLUMN city VARCHAR(100),
  ADD COLUMN pincode VARCHAR(10);
