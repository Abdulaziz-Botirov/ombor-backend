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
  origin: [
    'http://localhost:5173',
    'https://sklat-ombor.vercel.app'
  ],
  credentials: true
}))

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.get('/', (_req, res) => {
  res.json({ message: 'Backend ishlayapti' })
})

app.get('/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1')
    res.json({ ok: true })
  } catch {
    res.status(500).json({ ok: false })
  }
})

// ROUTES
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/sales', salesRoutes)
app.use('/api/finance', financeRoutes)
app.use('/api/currency-rate', currencyRoutes)
app.use('/api/dashboard', dashboardRoutes)

// 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route topilmadi' })
})

// ERROR
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(500).json({ message: 'Server xato' })
})

// START
const PORT = process.env.PORT || 5000

app.listen(PORT, '0.0.0.0', async () => {
  try {
    await pool.query('SELECT 1')
    console.log('✅ DB ulandi')
    console.log(`🚀 Server ${PORT} portda`)
  } catch (err) {
    console.error('DB ERROR:', err)
  }
})