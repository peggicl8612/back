import { Schema, model, ObjectId, Error } from 'mongoose'
import validator from 'validator'
import bcrypt from 'bcrypt'
import UserRole from '../enums/UserRole.js'

const cartSchema = new Schema({
  product: {
    type: ObjectId,
    ref: 'products',
    required: [true, 'userCartProductRequired'],
  },
  quantity: {
    type: Number,
    required: [true, 'userCartQuantityRequired'],
    min: [1, 'userCartQuantityTooSmall'],
  },
})

const schema = new Schema(
  {
    account: {
      type: String,
      required: [true, 'userAccountRequired'],
      minlength: [4, 'userAccountTooShort'],
      maxlength: [20, 'userAccountTooLong'],
      unique: true,
      validate: {
        validator(value) {
          return validator.isAlphanumeric(value)
        },
        message: 'userAccountInvalid',
      },
    },
    password: {
      type: String,
      required: [true, 'userPasswordRequired'],
    },
    email: {
      type: String,
      required: [true, 'userEmailRequired'],
      unique: true,
      validate: {
        validator(value) {
          return validator.isEmail(value)
        },
        message: 'userEmailInvalid',
      },
    },
    tokens: {
      type: [String],
    },
    role: {
      type: Number,
      default: UserRole.USER,
    },
    cart: {
      type: [cartSchema],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

// schema.virtual(欄位名稱).get(資料產生方式)
// 建立不存在的動態虛擬欄位
// 資料產生方式 function 內的 this 代表一筆資料
schema.virtual('cartQuantity').get(function () {
  const user = this
  return user.cart.reduce((total, current) => {
    return total + current.quantity
  }, 0)
})

// mongoose 驗證後，存入資料庫前執行動作
schema.pre('save', function (next) {
  const user = this
  // 密碼欄位有修改再處理
  console.log('modified', user.isModified('password'))
  if (user.isModified('password')) {
    // 自己寫驗證
    if (user.password.length < 4) {
      const error = new Error.ValidationError()
      error.addError('password', new Error.ValidatorError({ message: 'userPasswordTooShort' }))
      next(error)
    } else if (user.password.length > 20) {
      const error = new Error.ValidationError()
      error.addError('password', new Error.ValidatorError({ message: 'userPasswordTooLong' }))
      next(error)
    } else {
      user.password = bcrypt.hashSync(user.password, 10)
    }
  }
  next()
})

export default model('users', schema)
