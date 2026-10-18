import globalSetup from "./globalSetup.js";

// Rebuilds the test database; used by the end-to-end tests before they start
globalSetup()
  .then(() => console.log(`Reset ${process.env.PG_DATABASE}`))
  .catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
