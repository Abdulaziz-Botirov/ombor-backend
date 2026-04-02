import { Router } from 'express'
import { getSales, createSale, payDebt } from '../controllers/salesController.js'

const router = Router()

router.get('/', getSales)
router.post('/', createSale)
router.put('/:id/pay-debt', payDebt)

export default router