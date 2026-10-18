import { execSync } from "child_process";

// Start every run from a fresh copy of the seed data
export default function globalSetup() {
  execSync("npm run db:reset:test", { cwd: "../server", stdio: "inherit" });
}
