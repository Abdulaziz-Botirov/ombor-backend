import { pool } from '../config/db.js'

export async function getFinance(req, res) {
  try {
    const result = await pool.query(
      'SELECT * FROM finance_records ORDER BY finance_date DESC, created_at DESC'
    )
    res.json(result.rows)
  } catch (error) {
    console.error('GET FINANCE ERROR:', error)
    res.status(500).json({ message: 'Server xatosi' })
  }
}

export async function createFinance(req, res) {
  try {
    const {
      type,
      title,
      amount_uzs,
      amount_usd,
      quantity,
      unit,
      item_count,
      finance_date,
    } = req.body

    if (!type || !title || !finance_date) {
      return res.status(400).json({ message: 'Barcha maydonlarni to‘ldiring' })
    }

    await pool.query(
      `INSERT INTO finance_records
      (type, title, amount_uzs, amount_usd, quantity, unit, item_count, finance_date)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
      [
        type,
        title,
        Number(amount_uzs || 0),
        Number(amount_usd || 0),
        Number(quantity || 0),
        unit || 'dona',
        Number(item_count || 0),
        finance_date,
      ]
    )

    res.status(201).json({ message: 'Kirim/chiqim saqlandi' })
  } catch (error) {
    console.error('CREATE FINANCE ERROR:', error)
    res.status(500).json({ message: 'Server xatosi' })
  }
}

export async function deleteFinance(req, res) {
  try {
    await pool.query('DELETE FROM finance_records WHERE id = $1', [req.params.id])
    res.json({ message: 'O‘chirildi' })
  } catch (error) {
    console.error('DELETE FINANCE ERROR:', error)
    res.status(500).json({ message: 'Server xatosi' })
  }
}