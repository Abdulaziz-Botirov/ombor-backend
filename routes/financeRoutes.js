import { Router } from 'express'
import { createFinance, deleteFinance, getFinance } from '../controllers/financeController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()
router.use(authMiddleware)
router.get('/', getFinance)
router.post('/', createFinance)
router.delete('/:id', deleteFinance)
export default router
