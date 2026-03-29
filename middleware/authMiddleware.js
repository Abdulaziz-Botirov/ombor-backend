import jwt from 'jsonwebtoken'
import dotenv from 'dotenv'

dotenv.config()

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader) return res.status(401).json({ message: 'Token topilmadi' })

  const token = authHeader.split(' ')[1]
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    res.status(401).json({ message: 'Token noto‘g‘ri' })
  }
}
