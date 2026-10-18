import bcrypt from "bcrypt";
import { createClient } from "./client.js";
import products from "./products.js";

const demoUser = {
  name: "Demo User",
  email: "demo@poscon.dev",
  pnum: "9999999999",
  password: "demo1234",
  address: "221B Baker Street, Mumbai",
};

async function seed() {
  const db = createClient();
  await db.connect();
  try {
    await db.query("BEGIN");
    await db.query("TRUNCATE payments, order_items, orders, cart, products, users RESTART IDENTITY CASCADE");

    for (const [index, product] of products.entries()) {
      // Spread arrival dates so the newest products come last in the list
      const daysAgo = products.length - index;
      await db.query(
        `INSERT INTO products (namee, description, img, price, sellprice, gender, category, is_bestseller, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW() - $9 * INTERVAL '1 day')`,
        [
          product.namee,
          product.description,
          product.img,
          product.price,
          product.sellprice,
          product.gender,
          product.category,
          product.bestseller || false,
          daysAgo,
        ]
      );
    }

    const passhash = await bcrypt.hash(demoUser.password, 10);
    await db.query(
      "INSERT INTO users (name, email, pnum, passhash, address) VALUES ($1, $2, $3, $4, $5)",
      [demoUser.name, demoUser.email, demoUser.pnum, passhash, demoUser.address]
    );

    await db.query("COMMIT");
    console.log(`Seeded ${products.length} products and 1 demo user`);
    console.log(`Demo login: ${demoUser.email} / ${demoUser.password}`);
  } catch (error) {
    await db.query("ROLLBACK");
    throw error;
  } finally {
    await db.end();
  }
}

seed().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
