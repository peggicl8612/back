import { StatusCodes } from 'http-status-codes'
import Rehome from '../models/rehome.js'
import User from '../models/user.js'
import validator from 'validator'
export const create = async (req, res) => {
  console.log('create_rehome', req.body)
  try {
    const { name, age, breed, gender, description } = req.body

    if (!req.user) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: '用戶未登入',
      })
    }

    // 用戶帳號
    const userAccount = req.user.account
    const email = req.user.email

    const image = req.file ? req.file.path : null
    const newRehome = new Rehome({
      name,
      age,
      breed,
      email,
      gender,
      image,
      description,
      status: 'pending', // 預設審核中
      userAccount,
    })

    await newRehome.save()
    res.status(StatusCodes.CREATED).json({
      success: true,
      message: '送養請求已送出，等待管理員審核',
      result: newRehome,
    })
  } catch (error) {
    console.log('create_rehome', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getAll = async (req, res) => {
  try {
    const rehomes = await Rehome.find({})
    console.log('req.user:', req.user) // 檢查 user 物件的內容
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: rehomes,
    })
  } catch (error) {
    console.log('controller_rehome_getAll', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getByUser = async (req, res) => {
  try {
    console.log('登入的使用者 req.user:', req.user)
    const rehomes = await Rehome.find({ userAccount: req.user.account }).select(
      'userAccount userEmail',
    )
    res.status(200).json({ success: true, result: rehomes })
  } catch (error) {
    console.log('controller_rehome_getByUser', error)
    res.status(500).json({ success: false, message: 'serverError' })
  }
}

export const edit = async (req, res) => {
  try {
    // 確認 ID 是否為有效的 MongoDB ID
    if (!validator.isMongoId(req.params.id)) throw new Error('ID')

    // 從請求的 body 中取得要更新的審核狀態
    const { status } = req.body

    // 更新資料
    const result = await Rehome.findByIdAndUpdate(
      req.params.id,
      { status },
      {
        runValidators: true,
        new: true, // 返回更新後的資料
      },
    ).orFail(new Error('NOT FOUND'))

    // 假設 User 模型有送養紀錄欄位，我們需要更新使用者的送養紀錄
    const user = await User.findOne({ account: result.userAccount })
    if (user) {
      // 找到對應使用者後，將送養紀錄的審核狀態進行更新
      const rehomeRecord = user.rehomes.find(
        (record) => record._id.toString() === result._id.toString(),
      )
      if (rehomeRecord) {
        rehomeRecord.status = status // 更新審核狀態
        await user.save() // 保存更新到使用者資料
      }
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: '審核狀態更新成功',
      result,
    })
  } catch (error) {
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'RehomeIdInvalid', // ID 格式無效
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'RehomeNotFound', // 未找到該送養表單
      })
    } else if (error.name === 'ValidationError') {
      const key = Object.keys(error.errors)[0]
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: error.errors[key].message, // 驗證錯誤
      })
    } else {
      res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'serverError', // 伺服器錯誤
      })
    }
  }
}
