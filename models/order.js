import { Schema, model, ObjectId } from 'mongoose'

const cartSchema = new Schema({
  product: {
    type: ObjectId,
    ref: 'products',
    required: [true, 'orderCartProductRequired'],
  },
  quantity: {
    type: Number,
    required: [true, 'orderCartQuantityRequired'],
    min: [1, 'orderCartQuantityTooSmall'],
  },
})

const schema = new Schema(
  {
    user: {
      type: ObjectId,
      ref: 'users',
      required: [true, 'orderUserRequired'],
    },
    cart: {
      type: [cartSchema],
      required: [true, 'orderCartRequired'],
      validate: {
        validator(value) {
          return value.length > 0
        },
        message: 'orderCartEmpty',
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('orders', schema)
