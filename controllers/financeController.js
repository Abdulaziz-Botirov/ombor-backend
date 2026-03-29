import { pool } from '../config/db.js'

export async function getFinance(_req, res) {
  try {
    const result = await pool.query('SELECT * FROM finance_records ORDER BY finance_date DESC, created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('GET FINANCE ERROR:', error)
    res.status(500).json({ message: 'Kirim va chiqimlarni olishda xatolik' })
  }
}

export async function createFinance(req, res) {
  try {
    const { type, title, amount_uzs, finance_date } = req.body
    if (!type || !title || !amount_uzs || !finance_date) {
      return res.status(400).json({ message: 'Barcha maydonlarni to‘ldiring' })
    }

    const result = await pool.query(
      'INSERT INTO finance_records (type, title, amount_uzs, finance_date) VALUES ($1,$2,$3,$4) RETURNING *',
      [type, title.trim(), amount_uzs, finance_date],
    )
    res.status(201).json(result.rows[0])
  } catch (error) {
    console.error('CREATE FINANCE ERROR:', error)
    res.status(500).json({ message: 'Kirim / chiqimni saqlashda xatolik' })
  }
}

export async function deleteFinance(req, res) {
  try {
    await pool.query('DELETE FROM finance_records WHERE id = $1', [req.params.id])
    res.json({ message: 'O‘chirildi' })
  } catch (error) {
    console.error('DELETE FINANCE ERROR:', error)
    res.status(500).json({ message: 'Yozuvni o‘chirishda xatolik' })
  }
}
