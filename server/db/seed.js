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
    await db.query("TRUNCATE cart, products, users RESTART IDENTITY CASCADE");

    for (const product of products) {
      await db.query(
        `INSERT INTO products (namee, description, img, price, sellprice, gender, category, is_bestseller)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          product.namee,
          product.description,
          product.img,
          product.price,
          product.sellprice,
          product.gender,
          product.category,
          product.bestseller || false,
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
