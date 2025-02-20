import { Router } from 'express'
import * as user from '../controllers/user.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'
import { uploadAvatar } from '../controllers/user.js'

const router = Router()
// const { updateLikedCat } = require('../controllers/userController') // 喜歡

router.post('/', user.create)
router.post('/login', auth.login, user.login)
// router.post('/upload-avatar', upload, user.login, uploadAvatar)
router.get('/profile', auth.jwt, user.profile)
router.patch('/refresh', auth.jwt, user.refresh)
router.delete('/logout', auth.jwt, user.logout)
router.get('/cart', auth.jwt, user.getCart)
router.patch('/cart', auth.jwt, user.updateCart)
router.get('/all', auth.jwt, user.getAllUsers)
router.patch('/:id', auth.jwt, upload, user.updateUser)
router.get('/me', auth.jwt, user.profile)
//喜歡
// router.patch('/favorites', updateLikedCat)

export default router
