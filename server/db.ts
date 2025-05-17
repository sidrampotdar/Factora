import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
// Update the import path below to the actual relative path where your schema file is located, for example:
import * as schema from "../shared/schema";

const db2 ="postgresql://siddu_owner:npg_xvf2S0aFztWp@ep-small-sound-a4e1w37s-pooler.us-east-1.aws.neon.tech/siddu?sslmode=require"

neonConfig.webSocketConstructor = ws;

if (!db2) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const pool = new Pool({ connectionString: db2 });
export const db = drizzle(pool, { schema });