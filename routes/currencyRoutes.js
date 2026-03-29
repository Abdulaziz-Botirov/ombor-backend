import { Router } from 'express'
import { getRate, updateRate } from '../controllers/currencyController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()
router.get('/', authMiddleware, getRate)
router.put('/', authMiddleware, updateRate)
export default router
