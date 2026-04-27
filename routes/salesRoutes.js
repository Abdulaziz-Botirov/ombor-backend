import { Router } from 'express'
import { getSales, createSale, payDebt } from '../controllers/salesController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getSales)
router.post('/', createSale)
router.put('/:id/pay-debt', payDebt)

export default router