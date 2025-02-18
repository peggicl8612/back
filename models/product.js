import { Schema, model } from 'mongoose'

const schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'productNameRequired'],
    },
    age: {
      type: String,
      required: [true, 'catAgeRequired'],
      min: [0, 'catAgeRequiredTooSmall'],
    },
    image: {
      type: String,
      required: [true, 'productDescriptionRequired'],
    },
    category: {
      type: String,
      required: [true, 'CatBreedRequired'],
      enum: {
        values: ['black', 'orange', 'flower', 'tiger'],
        message: 'CatBreedInvalid',
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
