import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'productNameRequired'],
    },
    price: {
      type: Number,
      required: [true, 'productPriceRequired'],
      min: [0, 'productPriceTooSmall'],
    },
    image: {
      type: String,
      required: [true, 'productImageRequired'],
    },
    description: {
      type: String,
      required: [true, 'productDescriptionRequired'],
    },
    category: {
      type: String,
      required: [true, 'productCategoryRequired'],
      enum: {
        values: ['food', 'drink', 'music', 'phone'],
        message: 'productCategoryInvalid',
      },
    },
    sell: {
      type: Boolean,
      required: [true, 'productSellRequired'],
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('products', schema)
