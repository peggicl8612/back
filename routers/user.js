import { Router } from 'express'
import * as user from '../controllers/user.js'
import * as auth from '../middlewares/auth.js'

const router = Router()

router.post('/', user.create)
router.post('/login', auth.login, user.login)
router.get('/profile', auth.jwt, user.profile)
router.patch('/refresh', auth.jwt, user.refresh)
router.delete('/logout', auth.jwt, user.logout)
router.get('/cart', auth.jwt, user.getCart)
router.patch('/cart', auth.jwt, user.updateCart)

export default router
