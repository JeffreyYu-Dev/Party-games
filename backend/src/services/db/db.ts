import { env } from "#/config/env";
import { drizzle } from "drizzle-orm/neon-http";

import { relations } from "./relations";
import * as schema from "./schemas";

const db = drizzle(env.databaseURL, { schema, relations });

export { db };
