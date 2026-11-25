import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

declare global {
  var _postgresPool: Pool | undefined;
}

export const isPostgresConfigured = (): boolean => {
  return Boolean(process.env.SQL_HOST || process.env.DATABASE_URL);
};

export const createPool = () => {
  if (!isPostgresConfigured()) {
    return null;
  }

  if (!global._postgresPool) {
    const connStr = process.env.DATABASE_URL || '';
    const isSupabaseOrRemote = Boolean(
      connStr.includes('supabase') ||
      connStr.includes('pooler') ||
      connStr.includes('neon') ||
      connStr.includes('render') ||
      connStr.includes('sslmode=') ||
      process.env.SQL_SSL === 'true'
    );

    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      connectionString: process.env.DATABASE_URL,
      ssl: isSupabaseOrRemote ? { rejectUnauthorized: false } : undefined,
      max: 10,
      connectionTimeoutMillis: 10000,
    });

    global._postgresPool.on('error', (err) => {
      console.error('Unexpected error on idle SQL pool client:', err);
    });
  }
  return global._postgresPool;
};

const pool = createPool();

export const db = pool ? drizzle(pool, { schema }) : null;
