import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
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

app.use(cors({
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',')
    : '*',
  credentials: true,
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (_req, res) => {
  res.status(200).json({ message: 'Ombor backend ishlayapti' })
})

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    return res.status(200).json({ ok: true, message: 'Server va DB ishlayapti' })
  } catch (error) {
    console.error('HEALTH ERROR:', error)
    return res.status(500).json({ ok: false, message: 'DB ulanmagan' })
  }
})

app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/currency-rate', currencyRoutes)
app.use('/api/dashboard', dashboardRoutes)

async function ensureSchema() {
  const queries = [
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

  for (const sql of queries) {
    await pool.query(sql)
  }

  console.log('✅ Schema tekshirildi')
}

app.use((req, res) => {
  res.status(404).json({ message: 'Route topilmadi' })
})

app.use((err, _req, res, _next) => {
  console.error('UNHANDLED EXPRESS ERROR:', err)
  res.status(500).json({ message: 'Server xatoligi' })
})

async function startServer() {
  try {
    await pool.query('SELECT 1')
    console.log('✅ DB connected')

    await ensureSchema()

    const PORT = process.env.PORT || 5000

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`)
    })
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