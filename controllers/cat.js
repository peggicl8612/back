import { StatusCodes } from 'http-status-codes'
import Cat from '../models/cat.js'
import validator from 'validator'

export const create = async (req, res) => {
  console.log('Received body:', req.body)
  console.log('Received file:', req.file)
  try {
    // 檢查並處理圖片資料
    req.body.image = req.file?.path || null
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
    // 取得所有正在認養中的貓咪
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

export const getById = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')
    const result = await Cat.findById(req.params.id)
    if (!result) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'catNotFound',
      })
    }
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.log('controller_cat_getId', error)
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'CatIdInvalid',
    })
  }
}

export const edit = async (req, res) => {
  try {
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    req.body.image = req.file?.path ?? undefined

    const result = await Cat.findByIdAndUpdate(req.params.id, req.body, {
      runValidators: true,
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
    const { catId } = req.params
    const userId = req.user._id // 從 JWT 取得使用者 ID

    if (!validator.isMongoId(catId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'CatIdInvalid',
      })
    }

    const cat = await Cat.findById(catId)
    if (!cat) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'catNotFound',
      })
    }

    if (!cat.likedBy) {
      cat.likedBy = []
    }

    if (cat.likedBy.includes(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'alreadyLiked',
      })
    }

    cat.likedBy.push(userId)
    cat.likes += 1
    await cat.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'likeSuccess',
      likes: cat.likes,
    })
  } catch (error) {
    console.log('controller_cat_like', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const unlike = async (req, res) => {
  try {
    const { catId } = req.params
    const userId = req.user._id // 從 JWT 取得使用者 ID

    if (!validator.isMongoId(catId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'CatIdInvalid' })
    }

    const cat = await Cat.findById(catId)
    if (!cat) {
      return res.status(StatusCodes.NOT_FOUND).json({ success: false, message: 'catNotFound' })
    }

    if (!cat.likedBy.includes(userId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({ success: false, message: 'notLiked' })
    }

    // 從 likedBy 陣列移除該使用者 ID
    cat.likedBy = cat.likedBy.filter((id) => id.toString() !== userId.toString())
    cat.likes = Math.max(0, cat.likes - 1)
    await cat.save()

    res.status(StatusCodes.OK).json({ success: true, message: 'unlikeSuccess', likes: cat.likes })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({ success: false, message: 'serverError' })
  }
}
