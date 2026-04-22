import { Router } from 'express'
import {
  createProduct,
  deleteProduct,
  getProducts,
  getProductsByDate,
  updateProduct
} from '../controllers/productController.js'
import authMiddleware from '../middleware/auth.js'

const router = Router()

router.use(authMiddleware)

router.get('/', getProducts)
router.get('/by-date', getProductsByDate)
router.post('/', createProduct)
router.put('/:id', updateProduct)
router.delete('/:id', deleteProduct)

export default router