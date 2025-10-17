// Reference: javascript_database blueprint integration
// NOTE: This app uses Firebase Firestore, not PostgreSQL
// This file is kept for backward compatibility but is not actively used
import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

// DATABASE_URL is optional since we use Firestore
const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://dummy@localhost/dummy';

export const pool = new Pool({ connectionString: DATABASE_URL });
export const db = drizzle({ client: pool, schema });
