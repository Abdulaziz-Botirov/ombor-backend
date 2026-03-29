import { pool } from '../config/db.js'

export async function getProducts(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('GET PRODUCTS ERROR:', error)
    res.status(500).json({ message: 'Mahsulotlarni olishda xatolik' })
  }
}

export async function createProduct(req, res) {
  try {
    const { image_url, name, price_uzs, cost_uzs, quantity, unit, product_date } = req.body

    if (!name || !price_uzs || !cost_uzs || !quantity || !unit || !product_date) {
      return res.status(400).json({ message: 'Barcha maydonlarni to‘ldiring' })
    }

    const rateRow = await pool.query('SELECT rate FROM currency_rate ORDER BY updated_at DESC, id DESC LIMIT 1')
    const rate = Number(rateRow.rows[0]?.rate || 12900)
    const priceUsd = Number(price_uzs) / rate
    const costUsd = Number(cost_uzs) / rate
    const profitUsd = (Number(price_uzs) - Number(cost_uzs)) / rate

    const result = await pool.query(
      `INSERT INTO products (image_url, name, price_uzs, price_usd, cost_uzs, cost_usd, profit_usd, quantity, unit, product_date)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       RETURNING *`,
      [image_url || '', name.trim(), price_uzs, priceUsd, cost_uzs, costUsd, profitUsd, quantity, unit, product_date],
    )

    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('CREATE PRODUCT ERROR:', error)
    res.status(500).json({ message: 'Mahsulotni saqlashda xatolik' })
  }
}

export async function updateProduct(req, res) {
  try {
    const { id } = req.params
    const { image_url, name, price_uzs, cost_uzs, quantity, unit, product_date } = req.body

    const rateRow = await pool.query('SELECT rate FROM currency_rate ORDER BY updated_at DESC, id DESC LIMIT 1')
    const rate = Number(rateRow.rows[0]?.rate || 12900)
    const priceUsd = Number(price_uzs) / rate
    const costUsd = Number(cost_uzs) / rate
    const profitUsd = (Number(price_uzs) - Number(cost_uzs)) / rate

    const result = await pool.query(
      `UPDATE products
         SET image_url=$1, name=$2, price_uzs=$3, price_usd=$4, cost_uzs=$5, cost_usd=$6,
             profit_usd=$7, quantity=$8, unit=$9, product_date=$10, updated_at=CURRENT_TIMESTAMP
       WHERE id=$11
       RETURNING *`,
      [image_url || '', name.trim(), price_uzs, priceUsd, cost_uzs, costUsd, profitUsd, quantity, unit, product_date, id],
    )

    if (!result.rows[0]) {
      return res.status(404).json({ message: 'Mahsulot topilmadi' })
    }

    res.json(result.rows[0])
  } catch (error) {
    console.error('UPDATE PRODUCT ERROR:', error)
    res.status(500).json({ message: 'Mahsulotni yangilashda xatolik' })
  }
}

export async function deleteProduct(req, res) {
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [req.params.id])
    res.json({ message: 'O‘chirildi' })
  } catch (error) {
    console.error('DELETE PRODUCT ERROR:', error)
    res.status(500).json({ message: 'Mahsulotni o‘chirishda xatolik' })
  }
}

export async function getProductsByDate(req, res) {
  try {
    const { range = 'all' } = req.query
    let condition = ''
    if (range === 'today') condition = 'WHERE product_date = CURRENT_DATE'
    if (range === 'week') condition = "WHERE product_date >= CURRENT_DATE - INTERVAL '7 days'"
    if (range === 'month') condition = "WHERE product_date >= CURRENT_DATE - INTERVAL '30 days'"
    const result = await pool.query(`SELECT * FROM products ${condition} ORDER BY product_date DESC, created_at DESC`)
    res.json(result.rows)
  } catch (error) {
    console.error('GET PRODUCTS BY DATE ERROR:', error)
    res.status(500).json({ message: 'Sanalar bo‘yicha mahsulotlarni olishda xatolik' })
  }
}
