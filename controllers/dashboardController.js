import { pool } from '../config/db.js'

export async function getStats(_req, res) {
  try {
    const [products, sales, income, expense] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS count FROM products'),
      pool.query('SELECT COUNT(*)::int AS count FROM sales'),
      pool.query("SELECT COALESCE(SUM(amount_uzs),0) AS total FROM finance_records WHERE type='income'"),
      pool.query("SELECT COALESCE(SUM(amount_uzs),0) AS total FROM finance_records WHERE type='expense'"),
    ])

    res.json({
      totalProducts: products.rows[0].count,
      totalSales: sales.rows[0].count,
      totalIncome: income.rows[0].total,
      totalExpense: expense.rows[0].total,
    })
  } catch (error) {
    console.error('GET STATS ERROR:', error)
    res.status(500).json({ message: 'Statistikani olishda xatolik' })
  }
}
