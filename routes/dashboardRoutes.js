import { Router } from 'express'
import { getStats } from '../controllers/dashboardController.js'
import { authMiddleware } from '../middleware/authMiddleware.js'

const router = Router()
router.use(authMiddleware)
router.get('/stats', getStats)
export default router
