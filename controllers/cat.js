import { StatusCodes } from 'http-status-codes'
import Cat from '../models/cat.js'
import validator from 'validator'

// 新增貓咪
export const create = async (req, res) => {
  // console.log('Received body:', req.body)
  // console.log('Received file:', req.file)
  try {
    // 檢查並處理圖片資料
    // req.file 是 cloudinary 的檔案資訊
    req.body.image = req.file?.path || ''
    const result = await Cat.create(req.body) // 建立貓咪資料
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'serverError',
      })
    }
  }
}

export const get = async (req, res) => {
  try {
    // 取得所有正在認養中的貓咪 , 在架上的
    const result = await Cat.find({ isAdopting: true })
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controller_cat_get', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}
// 新增 getAll 處理取得所有貓咪資料的邏輯(只有管理員可以看到)
export const getAll = async (req, res) => {
  try {
    const result = await Cat.find()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controller_cat_getAll', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getId = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')
    const result = await Cat.findById(req.params.id).orFail(new Error('NOT FOUND'))
    res.status(StatusCodes.OK).json({
      success: true,
      message: 'catIdInvalid',
      result,
    })
  } catch (error) {
    console.log('controller_cat_getId', error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'catNotFound',
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: '',
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'severError',
      })
    }
  }
}

export const edit = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')
    // 換掉圖片
    // req.body.image = req.file?.path || ''
    // => 當前面是 undefined 會變成空的(編輯時若未更換圖片,表單圖片會是空的文字,又因為有執行驗證,空的文字會變成貓咪的照片必填 => 編輯錯誤)

    req.body.image = req.file?.path

    const result = await Cat.findByIdAndUpdate(req.params.id, req.body, {
      // 執行驗證
      runValidators: true,
      // 回傳新的資料
      new: true,
    }).orFail(new Error('NOT FOUND'))

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'CatIdInvalid',
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'CatNotFound',
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message,
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'serverError',
      })
    }
  }
}

export const like = async (req, res) => {
  try {
    const { id } = req.params // 改為 id
    const userId = req.user._id // 從 JWT 取得使用者 ID

    if (!validator.isMongoId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'IdInvalid',
      })
    }

    const updatedCat = await Cat.findByIdAndUpdate(
      id,
      {
        $addToSet: { likedBy: userId }, // 確保不會重複加入
        $inc: { likes: 1 }, // 增加按讚數
      },
      { new: true }, // 回傳更新後的資料
    )

    if (!updatedCat) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'catNotFound',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'likeSuccess',
      likes: updatedCat.likes,
    })
  } catch (error) {
    console.error('controller_cat_like', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const unlike = async (req, res) => {
  try {
    const { id } = req.params // 改為 id
    const userId = req.user._id // 從 JWT 取得使用者 ID

    if (!validator.isMongoId(id)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'IdInvalid',
      })
    }

    const updatedCat = await Cat.findByIdAndUpdate(
      id,
      {
        $pull: { likedBy: userId }, // 移除使用者按讚
        $inc: { likes: -1 }, // 減少按讚數
      },
      { new: true }, // 回傳更新後的資料
    )

    if (!updatedCat) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'catNotFound',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'unlikeSuccess',
      likes: updatedCat.likes,
    })
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}
