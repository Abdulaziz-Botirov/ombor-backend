import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const useDatabaseUrl = !!process.env.DATABASE_URL

export const pool = new Pool(
  useDatabaseUrl
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
      }
    : {
        user: String(process.env.DB_USER || ''),
        password: String(process.env.DB_PASSWORD || ''),
        host: String(process.env.DB_HOST || 'localhost'),
        port: Number(process.env.DB_PORT || 5432),
        database: String(process.env.DB_NAME || ''),
      }
)

pool.on('error', (err) => {
  console.error('PostgreSQL pool error:', err)
})