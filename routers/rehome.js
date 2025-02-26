import { Router } from 'express'
import * as rehome from '../controllers/rehome.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = Router()

router.post('/', auth.jwt, upload, rehome.create)
router.get('/', auth.jwt, auth.admin, rehome.getAll)
router.get('/', auth.jwt, rehome.getByUser)
router.patch('/:id', auth.jwt, auth.admin, rehome.edit)

export default router
