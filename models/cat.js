import { Schema, model } from 'mongoose'

const catSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'catNameRequired'],
    },
    breed: {
      type: String,
      required: [true, 'catBreedRequired'],
    },
    age: {
      type: Number,
      required: [true, 'catAgeRequired'],
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
    likes: {
      type: Number,
      default: 0,
    },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'users' }],
    isAdopting: {
      type: Boolean,
      required: false,
    },
  },
  {
    versionKey: false,
    timestamps: true,
  },
)

export default model('Cat', catSchema)
