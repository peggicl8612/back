import express from 'express'
import * as cat from '../controllers/cat.js'
import * as auth from '../middlewares/auth.js'
import upload from '../middlewares/upload.js'

const routerCat = express.Router()

routerCat.post('/', auth.jwt, upload, cat.create)
routerCat.get('/', cat.get)
// routerCat.get('/all', auth.jwt, auth.admin, cat.getAll)
// routerCat.get('/:catId', cat.getId)
// routerCat.patch('/:catId', auth.jwt, upload, cat.edit)

// 按讚與取消按讚
routerCat.post('/:catId/like', auth.jwt, cat.like) //要在 controllers 新增 cat.js 處理按讚貓咪邏輯
routerCat.delete('/:catId/like', auth.jwt, cat.unlike)

export default routerCat
