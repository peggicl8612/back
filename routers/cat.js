import express from 'express'
import * as cat from '../controllers/cat.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const router = express.Router()

router.post('/', auth.jwt, upload, cat.create)
router.get('/', cat.get)
router.get('/all', auth.jwt, auth.admin, cat.getAll)
// router.get('/:catId', cat.getId)
// router.patch('/:catId', auth.jwt, upload, cat.edit)

// 按讚與取消按讚
router.post('/:catId/like', auth.jwt, cat.like) //要在 controllers 新增 cat.js 處理按讚貓咪邏輯
router.delete('/:catId/like', auth.jwt, cat.unlike)

export default router
