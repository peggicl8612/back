// 上傳的 middlewares
import multer from 'multer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import { StatusCodes } from 'http-status-codes'

// 設定 cloudinary (雲端)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

const upload = multer({
  storage: new CloudinaryStorage({ cloudinary }),
  // 過濾上傳檔案(過濾要收的檔案格式)
  // file = 檔案資訊
  // callback(錯誤, 是否允許)
  fileFilter(req, file, callback) {
    console.log(file)
    if (['image/jpeg', 'image/png', 'image/gif'].includes(file.mimetype)) {
      callback(null, true)
    } else {
      callback(new Error('檔案格式不支援')) // ❗拋出錯誤
    }
  },
  limits: {
    // 限制檔案尺寸 1MB
    fileSize: 5 * 1024 * 1024,
  },
})

export default (req, res, next) => {
  // single('image') 表示只上傳一張圖片
  // image 是 form-data 內的欄位名稱
  upload.single('image')(req, res, (error) => {
    if (error) {
      console.log(error)

      let message = 'uploadFailed' // 預設錯誤訊息

      if (error.code === 'LIMIT_FILE_SIZE') {
        message = '檔案大小超過限制'
      } else if (error.message === '檔案格式不支援') {
        message = '檔案格式不支援'
      }
      // 使用者沒有選擇檔案
      else if (!req.file) {
        message = '請選擇檔案'
      }
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message,
      })
    }
    next()
  })
}
