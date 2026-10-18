import "dotenv/config";

// Tests always run against a separate database so they never touch development data
const testDatabase = process.env.PG_TEST_DATABASE || "poscon_test";
if (!testDatabase.endsWith("_test")) {
  throw new Error(`Refusing to run tests against "${testDatabase}": the name must end with _test`);
}

process.env.PG_DATABASE = testDatabase;
// A connection string would point somewhere other than the test database
delete process.env.DATABASE_URL;
process.env.SESSION_SECRET = process.env.SESSION_SECRET || "test-secret";
process.env.AUTH_RATE_LIMIT = "10000";
process.env.CONTACT_RATE_LIMIT = "10000";
