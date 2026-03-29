import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { pool } from './config/db.js'
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import salesRoutes from './routes/salesRoutes.js'
import financeRoutes from './routes/financeRoutes.js'
import currencyRoutes from './routes/currencyRoutes.js'
import dashboardRoutes from './routes/dashboardRoutes.js'

dotenv.config()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
app.use(cors())
app.use(express.json())
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (_req, res) => res.json({ message: 'Ombor backend ishlayapti' }))
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/currency-rate', currencyRoutes)
app.use('/api/dashboard', dashboardRoutes)

app.use((err, _req, res, _next) => {
  console.error('UNHANDLED EXPRESS ERROR:', err)
  res.status(500).json({ message: 'Server xatoligi' })
})

async function ensureSchema() {
  const checks = [
    `CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS currency_rate (
      id SERIAL PRIMARY KEY,
      rate DECIMAL(12,2) NOT NULL DEFAULT 12800,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      image_url TEXT,
      name VARCHAR(255) NOT NULL,
      price_uzs DECIMAL(12,2) NOT NULL,
      price_usd DECIMAL(12,2) NOT NULL,
      cost_uzs DECIMAL(12,2) NOT NULL,
      cost_usd DECIMAL(12,2) NOT NULL,
      profit_usd DECIMAL(12,2) NOT NULL,
      quantity DECIMAL(12,2) NOT NULL,
      unit VARCHAR(50) DEFAULT 'dona',
      product_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS sales (
      id SERIAL PRIMARY KEY,
      product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
      customer_name VARCHAR(255) NOT NULL,
      sold_date DATE NOT NULL,
      quantity_sold DECIMAL(12,2) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `CREATE TABLE IF NOT EXISTS finance_records (
      id SERIAL PRIMARY KEY,
      type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
      title VARCHAR(180) NOT NULL,
      amount_uzs DECIMAL(12,2) NOT NULL,
      finance_date DATE NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )`,
    `INSERT INTO currency_rate (rate)
     SELECT 12800
     WHERE NOT EXISTS (SELECT 1 FROM currency_rate)`,
  ]

  for (const sql of checks) {
    await pool.query(sql)
  }

  const schemaPath = path.join(__dirname, 'sql', 'schema.sql')
  try {
    await fs.access(schemaPath)
  } catch {
    // ignore; runtime auto schema already applied
  }
}

async function startServer() {
  try {
    await pool.query('SELECT 1')
    console.log('✅ DB connected')
    await ensureSchema()
    const PORT = process.env.PORT || 5000
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  } catch (error) {
    console.error('SERVER START ERROR:', error)
    process.exit(1)
  }
}

process.on('uncaughtException', (error) => {
  console.error('UNCAUGHT EXCEPTION:', error)
})

process.on('unhandledRejection', (error) => {
  console.error('UNHANDLED REJECTION:', error)
})

startServer()
