import app from "./src/app.js";
import { config } from "./src/config/env.js";

app.listen(config.port, () => {
  console.log(`Server running on port http://localhost:${config.port}`);
});
