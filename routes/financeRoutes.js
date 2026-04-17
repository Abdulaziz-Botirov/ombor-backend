import { Router } from 'express'
import { getFinance, createFinance, deleteFinance } from '../controllers/financeController.js'

const router = Router()

router.get('/', getFinance)
router.post('/', createFinance)
router.delete('/:id', deleteFinance)

export default router