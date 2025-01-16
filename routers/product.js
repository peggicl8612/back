import { Router } from 'express'
import * as product from '../controllers/product.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', auth.jwt, auth.admin, upload, product.create)
router.get('/', product.get)
router.get('/all', auth.jwt, auth.admin, product.getAll)
router.get('/:id', product.getId)
router.patch('/:id', auth.jwt, auth.admin, upload, product.edit)

export default router
