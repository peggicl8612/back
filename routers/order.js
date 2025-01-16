import { Router } from 'express'
import * as order from '../controllers/order.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', auth.jwt, order.create)
router.get('/', auth.jwt, order.get)
router.get('/all', auth.jwt, auth.admin, order.getAll)

export default router
