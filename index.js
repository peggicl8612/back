import 'dotenv/config'
import express from 'express'
import mongoose from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import routerUser from './routers/user.js'
import routerProduct from './routers/product.js'
import routerOrder from './routers/order.js'
import routerCat from './routers/cat.js'
// cors 處理跨網域的請求
import cors from 'cors'
import './passport.js'
mongoose
  .connect(process.env.DB_URL)
  .then(() => {
    console.log('資料庫連線成功')
  })
  .catch((error) => {
    console.log('資料庫連線失敗')
    console.log(error)
  })

const app = express()

// 可允許來自任何域名的請求
app.use(cors())
// app.use(
//   cors({
//     // origin = 請求來源網域
//     // callback(錯誤, 是否允許通過)
//     origin(origin, callback) {
//       console.log('origin' + origin)
//       if (
//         // postman 的 origin 預設是 undefined
//         origin.includes('localhost') ||
//         origin.includes('127.0.0.1') ||
//         origin.includes('github.io')
//       ) {
//         callback(null, true)
//       } else {
//         callback(new Error('CORS'), false)
//       }
//     },
//   }),
// )

app.use(express.json())
app.use((error, req, res, next) => {
  res.status(StatusCodes.BAD_REQUEST).json({
    success: false,
    message: 'requestFormatError',
  })
})

app.use('/user', routerUser)
app.use('/product', routerProduct)
app.use('/order', routerOrder)
app.use('/cat', routerCat)

// app.post('/cat', (req, res) => {
//   res.send('已收到貓咪資料')
// })
app.listen(process.env.PORT || 4000, () => {
  console.log('伺服器啟動')
})
