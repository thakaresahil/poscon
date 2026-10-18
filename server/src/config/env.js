import "dotenv/config";

if (!process.env.SESSION_SECRET) {
  console.error("SESSION_SECRET is not set");
  process.exit(1);
}

export const config = {
  port: process.env.PORT || 9000,
  sessionSecret: process.env.SESSION_SECRET,
  clientOrigins: (process.env.CLIENT_ORIGIN || "http://localhost:3000")
    .split(",")
    .map((origin) => origin.trim()),
};
