import { pool } from '../config/db.js'

export async function getRate(_req, res) {
  try {
    const result = await pool.query('SELECT rate FROM currency_rate ORDER BY updated_at DESC, id DESC LIMIT 1')
    res.json({ rate: Number(result.rows[0]?.rate || 12900) })
  } catch (error) {
    console.error('GET RATE ERROR:', error)
    res.status(500).json({ message: 'Dollar kursini olishda xatolik' })
  }
}

export async function updateRate(req, res) {
  try {
    const { rate } = req.body
    if (!rate || Number(rate) <= 0) {
      return res.status(400).json({ message: 'To‘g‘ri kurs kiriting' })
    }

    await pool.query('INSERT INTO currency_rate (rate) VALUES ($1)', [rate])
    res.json({ message: 'Kurs yangilandi' })
  } catch (error) {
    console.error('UPDATE RATE ERROR:', error)
    res.status(500).json({ message: 'Dollar kursini yangilashda xatolik' })
  }
}
