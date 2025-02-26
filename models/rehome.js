import { Schema, model } from 'mongoose'

const rehomeSchema = new Schema(
  {
    userAccount: {
      type: String,
      required: [true, 'userAccountRequired'],
    },
    email: {
      type: String,
      required: [true, 'userEmailRequired'],
    },
    name: {
      type: String,
      required: [true, 'catNameRequired'],
    },
    age: {
      type: Number,
      required: [true, 'catAgeRequired'],
    },
    breed: {
      type: String,
      required: [true, 'catBreedRequired'],
    },
    gender: {
      type: String,
      required: [true, 'catGenderRequired'],
    },
    image: {
      type: String,
      required: [true, 'CatImageRequired'],
    },
    description: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      required: [true, 'rehomeStatusRequired'],
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'catStatusInvalid',
        default: 'pending',
      },
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('Rehome', rehomeSchema)
