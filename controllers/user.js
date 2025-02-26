import User from '../models/user.js'
import Product from '../models/product.js'
import Cat from '../models/cat.js'
import { StatusCodes } from 'http-status-codes'
import jwt from 'jsonwebtoken'
import validator from 'validator'

export const create = async (req, res) => {
  try {
    await User.create(req.body)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'MongoServerError' && error.code === 11000) {
      res.status(StatusCodes.CONFLICT).json({
        success: false,
        message: 'userAccountDuplicate',
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

export const getAllUsers = async (req, res) => {
  try {
    const result = await User.find()
    console.log('取得使用者(後端):', result)
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result,
    })
  } catch (error) {
    console.error('獲取使用者列表錯誤:', error)
    res.status(500).json({ message: '伺服器錯誤' })
  }
}

export const updateUser = async (req, res) => {
  try {
    console.log('收到囉')
    const { id } = req.params
    console.log(req.body)
    const updates = req.body
    console.log(updates)

    req.body.image = req.file?.path

    const updatedUser = await User.findByIdAndUpdate(id, updates, { new: true })

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' })
    }

    res.json({ message: 'User updated successfully', result: updatedUser })
  } catch (error) {
    res.status(500).json({ message: 'Error updating user', error: error.message })
  }
}

export const login = async (req, res) => {
  try {
    // jwt.sign(儲存資料, SECRET, 設定)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens.push(token)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: {
        token,
        account: req.user.account,
        role: req.user.role,
        cart: req.user.cartQuantity,
        phone: req.user.phone || '',
      },
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const profile = async (req, res) => {
  try {
    console.log('收到請求 /user/me，req.user:', req.user) // 確保前端帶了 token
    const user = await User.findById(req.user._id).select('-password')
    console.log('後端找到的 user:', user) // 確保 user 有抓到資料
    if (!user) {
      return res.status(404).json({ message: 'User not found' })
    }
    res.json({ result: user }) // 確保回應資料
  } catch (error) {
    console.error('獲取用戶資料錯誤:', error)
    res.status(500).json({ message: 'Error fetching profile', error: error.message })
  }
}

export const refresh = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex((token) => token === req.token)
    const token = jwt.sign({ _id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7 days' })
    req.user.tokens[idx] = token
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: token,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const logout = async (req, res) => {
  try {
    const idx = req.user.tokens.findIndex((token) => token === req.token)
    req.user.tokens.splice(idx, 1)
    await req.user.save()
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getCart = async (req, res) => {
  try {
    const result = await User.findById(req.user._id, 'cart').populate('cart.product')
    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: result.cart,
    })
  } catch (error) {
    console.log(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const updateCart = async (req, res) => {
  try {
    // 檢查傳入的商品 ID 格式
    if (!validator.isMongoId(req.body.product)) throw new Error('ID')
    // 檢查購物車內有沒有商品
    const idx = req.user.cart.findIndex((item) => item.product.toString() === req.body.product)
    if (idx > -1) {
      // 有商品，修改數量
      const quantity = req.user.cart[idx].quantity + parseInt(req.body.quantity)
      if (quantity > 0) {
        // 修改後大於 0，修改數量
        req.user.cart[idx].quantity = quantity
      } else {
        // 修改後小於等於 0，刪除商品
        req.user.cart.splice(idx, 1)
      }
    } else {
      // 沒有商品，檢查商品是否存在
      const product = await Product.findById(req.body.product).orFail(new Error('NOT FOUND'))
      // 商品沒有上架，錯誤
      if (!product.sell) throw new Error('SELL')

      req.user.cart.push({ product: req.body.product, quantity: req.body.quantity })
    }

    await req.user.save()

    res.status(StatusCodes.OK).json({
      success: true,
      message: '',
      result: req.user.cartQuantity,
    })
  } catch (error) {
    console.log(error)
    if (error.name === 'CastError' || error.message === 'ID') {
      res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'productIdInvalid',
      })
    } else if (error.message === 'NOT FOUND') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'productNotFound',
      })
    } else if (error.message === 'SELL') {
      res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'productNotOnSell',
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

// export const uploadAvatar = async (req, res) => {
//   try {
//     if (!req.file) {
//       return res.status(StatusCodes.BAD_REQUEST).json({
//         success: false,
//         message: '請選擇檔案',
//       })
//     }

//     if (!req.user) {
//       return res.status(StatusCodes.UNAUTHORIZED).json({
//         success: false,
//         message: '未登入',
//       })
//     }

//     // 取得 Cloudinary 上傳的圖片 URL
//     const imageUrl = req.file.path

//     // 更新使用者頭像
//     const user = await User.findByIdAndUpdate(req.user._id, { image: imageUrl }, { new: true })

//     return res.status(StatusCodes.OK).json({
//       success: true,
//       message: '上傳成功',
//       image: user.image,
//     })
//   } catch (error) {
//     console.error(error)
//     return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
//       success: false,
//       message: '伺服器錯誤',
//     })
//   }
// }

// user.js Controller
// export const updateFavorites = async (req, res) => {
//   try {
//     const { catId } = req.body
//     const id = req.user._id // 確保JWT Token已經驗證過

//     if (!catId) {
//       return res.status(400).json({ success: false, message: 'catId is required' })
//     }

//     const user = await User.findById(id)
//     if (!user) {
//       return res.status(404).json({ success: false, message: 'User not found' })
//     }

//     // 檢查貓咪是否已經在收藏列表中
//     const alreadyLiked = user.likes.includes(catId)
//     if (!alreadyLiked) {
//       user.likes.push(catId) // 將貓咪加入收藏
//     } else {
//       user.likes = user.likes.filter((id) => id !== catId) // 移除收藏
//     }

//     await user.save()

//     res.status(200).json({
//       success: true,
//       message: alreadyLiked ? 'Cat removed from favorites' : 'Cat added to favorites',
//     })
//   } catch (error) {
//     console.error(error)
//     res.status(500).json({ success: false, message: 'Internal server error' })
//   }
// }

export const like = async (req, res) => {
  try {
    const catId = req.body.catId
    const liked = req.body.liked
    // const userId = req.user._id

    // 檢查 catId 是否有效
    if (!validator.isMongoId(catId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'catIdInvalid',
      })
    }

    // 取得貓咪資料
    const cat = await Cat.findById(catId)
    if (!cat) {
      return res.status(404).json({
        success: false,
        message: 'Cat not found',
      })
    }

    // 檢查使用者是否已經按過讚
    const alreadyLikedCat = req.user.favorites.includes(catId)
    if (alreadyLikedCat && liked) {
      return res.status(400).json({
        success: false,
        message: 'You have already liked this cat',
      })
    }

    // 更新 user 和 cat 資料
    if (liked) {
      // 如果按讚，加入貓咪到 User 的 favorites
      req.user.favorites.push(catId)

      // 增加貓咪的 likes 數量
      cat.likes += 1
    } else {
      // 如果取消按讚，移除貓咪ID從 User 的 favorites
      req.user.favorites = req.user.favorites.filter((id) => id.toString() !== catId)

      // 減少貓咪的 likes 數量
      cat.likes -= 1
    }

    // 儲存更新
    await req.user.save() // 儲存 User 資料
    await cat.save() // 儲存 Cat 資料

    res.status(200).json({
      success: true,
      message: liked ? 'Cat liked successfully' : 'Cat unliked successfully',
      likes: cat.likes,
    })
  } catch (error) {
    console.error('Error in like controller:', error)
    res.status(500).json({
      success: false,
      message: 'Internal Server Error',
    })
  }
}

export const unlike = async (req, res) => {
  try {
    const { catId } = req.params
    const userId = req.user._id

    if (!validator.isMongoId(catId)) {
      return res.status(StatusCodes.BAD_REQUEST).json({
        success: false,
        message: 'catIdInvalid',
      })
    }

    // 從使用者的收藏列表移除該貓咪
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $pull: { favorites: catId } }, // 移除 `favorites` 陣列中的該貓咪
      { new: true },
    )

    if (!updatedUser) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'userNotFound',
      })
    }

    // 檢查目前的貓咪資訊，避免 likes 變負數
    const cat = await Cat.findById(catId)
    if (!cat) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'catNotFound',
      })
    }

    // 確保 likes 不會變成負數
    if (cat.likes > 0) {
      await Cat.findByIdAndUpdate(catId, {
        $pull: { likedBy: userId },
        $inc: { likes: -1 },
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      message: 'unlikeSuccess',
    })
  } catch (error) {
    console.error(error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'serverError',
    })
  }
}

export const getFavorites = async (req, res) => {
  try {
    // 檢查使用者是否存在
    if (!req.user || !req.user._id) {
      return res.status(StatusCodes.UNAUTHORIZED).json({
        success: false,
        message: 'Unauthorized access',
      })
    }

    // 查找使用者並填充 `favorites`
    const user = await User.findById(req.user._id).populate('favorites', 'name image likes')

    if (!user) {
      return res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: 'User not found',
      })
    }

    res.status(StatusCodes.OK).json({
      success: true,
      result: user.favorites, // 直接返回收藏貓咪清單
    })
  } catch (error) {
    console.error('獲取收藏貓咪錯誤:', error)
    res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server error',
    })
  }
}
