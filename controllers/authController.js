import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'
import { pool } from '../config/db.js'

dotenv.config()

export async function sendCode(_req, res) {
  return res.json({ message: 'Email tasdiqlash o‘chirilgan' })
}

export async function register(req, res) {
  try {
    const { name, email, password } = req.body

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Barcha maydonlarni to‘ldiring' })
    }

    const exists = await pool.query('SELECT id FROM users WHERE email = $1', [email.trim().toLowerCase()])
    if (exists.rows.length > 0) {
      return res.status(400).json({ message: 'Bu email bilan foydalanuvchi bor' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const result = await pool.query(
      'INSERT INTO users (name, email, password) VALUES ($1, $2, $3) RETURNING id, name, email',
      [name.trim(), email.trim().toLowerCase(), hashedPassword],
    )

    const user = result.rows[0]
    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.status(201).json({
      message: 'Muvaffaqiyatli ro‘yxatdan o‘tildi',
      user,
      token,
    })
  } catch (error) {
    console.error('REGISTER ERROR:', error)
    return res.status(500).json({ message: 'Server xatosi' })
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ message: 'Email va parolni kiriting' })
    }

    const result = await pool.query('SELECT id, name, email, password FROM users WHERE email = $1', [
      email.trim().toLowerCase(),
    ])
    const user = result.rows[0]

    if (!user) {
      return res.status(404).json({ message: 'Foydalanuvchi topilmadi' })
    }

    const ok = await bcrypt.compare(password, user.password)
    if (!ok) {
      return res.status(400).json({ message: 'Parol xato' })
    }

    const token = jwt.sign({ id: user.id, email: user.email, name: user.name }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    })

    return res.json({
      token,
      user: { id: user.id, name: user.name, email: user.email },
    })
  } catch (error) {
    console.error('LOGIN ERROR:', error)
    return res.status(500).json({ message: 'Server xatosi' })
  }
}
