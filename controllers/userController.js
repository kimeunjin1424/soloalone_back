const User = require('../models/user')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const CryptoJS = require('crypto-js')
const nodemailer = require('nodemailer')
const cloudinaryUploadImg = require('../Utils/cloudinary')
const Message = require('../models/message')
const bcrypt = require('bcrypt')
const { Expo } = require('expo-server-sdk')
const Room = require('../models/room')
const Order = require('../models/order')

let expo = new Expo({
  accessToken: process.env.EXPO_ACCESS_TOKEN,
  useFcmV1: true, // this can be set to true in order to use the FCM v1 API
})

const sendVerificationEmail = async (email, password) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kimp2375@gmail.com',
      pass: 'jlwd wmbe ijfl fpgs',
    },
  })

  console.log('email', email)

  const mailOptions = {
    from: '나혼자 솔로',
    to: email,
    subject: '나혼자 솔로- verify Password',
    text: `당신의 Password는 ${password}입니다.`,
  }

  try {
    await transporter.sendMail(mailOptions)
  } catch (err) {
    console.log('Error sending the verification Email', err)
  }
}

const hashPassword = (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(12, (err, salt) => {
      if (err) {
        reject(err)
      }
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) {
          reject(err)
        }
        resolve(hash)
      })
    })
  })
}

const comparePassword = (password, hashed) => {
  return bcrypt.compare(password, hashed)
}

const generateToken = (user) => {
  const payload = {
    userId: user._id,
    email: user._email,
  }

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '30d' })
  return token
}

const getLastMessage = async (myId, fdId) => {
  console.log('getLastmessage', myId, fdId)
  const msg = await Message.findOne({
    $or: [
      {
        $and: [
          {
            senderId: {
              $eq: myId,
            },
          },
          {
            receviedId: {
              $eq: fdId,
            },
          },
        ],
      },
      {
        $and: [
          {
            senderId: {
              $eq: fdId,
            },
          },
          {
            receviedId: {
              $eq: myId,
            },
          },
        ],
      },
    ],
  }).sort({
    createdAt: -1,
  })
  return msg
}

module.exports = {
  getFriends: async (req, res) => {
    const { myId } = req.body
    console.log('myId', myId)
    let fnd_msg = []
    try {
      const user = await User.findById(myId).populate(
        'matches',
        '_id name imageUrls'
      )
      //console.log('get friends User', user)
      // const friendGet = await User.find({
      //   _id: {
      //     $ne: myId,
      //   },
      // })
      for (let i = 0; i < user.matches.length; i++) {
        console.log('sdfsdfsdfsdfdsf')
        let lmsg = await getLastMessage(myId, user.matches[i]._id + '')
        fnd_msg = [
          ...fnd_msg,
          {
            fndInfo: user.matches[i].name,
            fndImage: user.matches[i].imageUrls[0],
            fndId: user.matches[i]._id + '',
            msgInfo: lmsg,
          },
        ]
      }
      //console.log('friends', fnd_msg)

      // const filter = friendGet.filter(d=>d.id !== myId );
      res.status(200).json({ success: true, friends: fnd_msg })
    } catch (error) {
      res.status(500).json({
        error: {
          errorMessage: 'Internal Sever Error',
        },
      })
    }
  },
  emailVerify: async (req, res) => {
    try {
      console.log('req.body, email verify', req.body)
      const { email } = req.body

      const existEmail = await User.findOne({ email: email })
      console.log('existEmail', existEmail)

      if (!existEmail) {
        return res.status(200).json({ message: 'success', status: true })
      } else {
        return res.status(200).json({ status: false, message: 'faulse' })
      }
    } catch (error) {
      console.log('email verify Error')
    }
  },
  apiUser: async (req, res) => {
    try {
      console.log('block', req.body.block)
      const users = await User.aggregate([
        {
          $match: {
            $and: [
              {
                gender: { $ne: req.body.gender },
              },
              {
                name: { $nin: [...req.body.block] },
              },
              {
                region: { $in: [req.body.region] },
              },
            ],
          },
        },
        { $sample: { size: 10 } },
      ])

      // const users = await User.find({
      //   gender: { $ne: req.body.gender },
      //   _id: { $ne: req.body.userId },
      //   region: { $in: req.body.region },
      // })

      if (users) {
        res.status(200).json({ status: true, users })
      } else {
        console.log('users Error')
        res.status(400).json({ status: false, message: 'users error' })
      }
    } catch (error) {
      console.log('users Error', error)
      res.status(500).json({ status: false, message: 'user Error' })
    }
  },
  register: async (req, res) => {
    try {
      const {
        email,
        gender,
        dateOfBirth,
        type,
        hometown,
        datingPreferences,
        lookingFor,
        imageUrls,
        prompts,
        likedProfiles,
        receviedLikes,
        matches,
        lastLogin,
        lastActive,
        visibility,
        blockUsers,
        age,
        decade,
        location,
        aggrement,
        region,
      } = req.body

      const exitingUser = await User.findOne({ email })
      const menNumber = await User.countDocuments({ gender: 'Men' })
      const womenNumber = await User.countDocuments({ gender: 'Women' })

      if (exitingUser) {
        //console.log('Email exist')
        return res.json(400).json({ message: 'Email already exist' })
      }

      const newUser = new User({
        name: gender == 'Men' ? `남자${menNumber}호` : `여자${womenNumber}호`,
        heartCount: gender == 'Men' ? 10 : 100,
        email,
        gender,
        dateOfBirth,
        type,
        region,
        hometown,
        datingPreferences,
        lookingFor,
        imageUrls,
        prompts,
        likedProfiles,
        receviedLikes,
        matches,
        lastLogin,
        lastActive,
        visibility,
        blockUsers,
        age,
        decade,
        location,
        aggrement,
        password: CryptoJS.AES.encrypt(
          req.body.password,
          process.env.SECRET_KEY
        ).toString(),
      })

      //const encrypted =  CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(key), 'phrase');

      await newUser.save()

      const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
        expiresIn: '70d',
      })

      res.status(200).json({ token })
    } catch (error) {
      console.error('Error creating user:', error)
      res.status(500).json({ error: 'Register Server Error' })
    }
  },
  login: async (req, res) => {
    const { email, password } = req.body
    console.log('login email password', email, password)
    const user = await User.findOne({ email })

    console.log('user', user)

    let originalText

    if (!user) {
      return res.status(200).json({ message: 'User not found', status: false })
    } else {
      const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY)
      originalText = bytes.toString(CryptoJS.enc.Utf8)
    }

    //const match = await comparePassword(password, user.password)

    if (password !== originalText) {
      res.status(200).json({ status: 400, message: 'Wrong password' })
    } else {
      const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
      })
      return res.status(200).json({ status: true, token: token })
    }
  },
  getUser: async (req, res) => {
    try {
      const { userId } = req.body
      console.log('userIdasda', userId)

      const user = await User.findById(userId)
        .populate('saveProfiles', '_id imageUrls name')
        .populate('likedProfiles', '_id')
        .populate('blockProfiles', '_id imageUrls name')
      if (!user) {
        console.log('get User badbad')
        return res.status(500).json({ message: 'User not found123' })
      } else {
        console.log('get User succesfully')
        console.log('usererer', user)
        res.status(200).json({ status: true, user: user, message: 'user good' })
      }
    } catch (error) {
      res.status(500).json({ message: 'Error fetching the user details' })
    }
  },
  getUsers: async (req, res) => {
    try {
      const { userId } = req.query

      const user = await User.findById(userId)

      if (!user) {
        return res
          .status(400)
          .json({ status: false, message: 'User not found' })
      }

      let filter = {}

      if (user.gender === 'Men') {
        filter.gender === 'Women'
      } else if (user.gender === 'Women') {
        filter.gender === 'Men'
      }

      let query = { _id: { $ne: userId } }

      if (user.type) {
        filter.type = user.type
      }

      const currentUser = await User.findById(userId)
        .populate('matches', '_id')
        .populate('likedProfiles', '_id')

      const matchesIds = currentUser.matches.map((f) => f._id)
      const crushIds = currentUser.likedProfiles.map((c) => c._id)

      console.log('filter', filter)

      const matches = await User.find(filter)
        .where('_id')
        .nin([userId, ...matchesIds, crushIds])

      return res.status(200).json({ status: true, matches })
    } catch (error) {
      console.error('Error fetching matches:', error)
      res.status(500).json({ message: 'get Users error' })
    }
  },
  likeProfile: async (req, res) => {
    try {
      const { userId, likedUserId, image, comment, name } = req.body

      // Update the liked user's receivedLikes array
      const exitingUser = await User.findById(userId)
      const likedUser = await User.findById(likedUserId)

      if (exitingUser.heartCount > 0) {
        await User.findByIdAndUpdate(likedUserId, {
          $push: {
            receviedLikes: {
              userId: userId,
              image: image,
              comment: comment,
              name: name,
            },
          },
          receviedHeartCount: likedUser.receviedHeartCount + 1,
        })
        // Update the user's likedProfiles array
        await User.findByIdAndUpdate(userId, {
          $push: {
            likedProfiles: likedUserId,
          },
          heartCount: exitingUser.heartCount - 1,
        })

        res
          .status(200)
          .json({ status: true, message: 'Profile liked successfully' })
      } else {
        res.status(400).json({ status: false, message: 'HeartCount is zero' })
      }
    } catch (error) {
      console.error('Error liking profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  saveProfiles: async (req, res) => {
    try {
      const { userId, saveUserId } = req.body

      // Update the liked user's receivedLikes array
      const exitingUser = await User.findById(saveUserId)

      if (exitingUser) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            saveProfiles: saveUserId,
          },
        })

        res.status(200).json({
          status: true,
          message: 'Save Profiles successfully',
          saveUserId: saveUserId,
        })
      } else {
        res
          .status(400)
          .json({ status: false, message: 'Save Profiles is zero' })
      }
    } catch (error) {
      console.error('Error liking profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  blockProfiles: async (req, res) => {
    try {
      const { userId, blockUserId } = req.body

      // Update the liked user's receivedLikes array
      const exitingUser = await User.findById(blockUserId)

      if (exitingUser) {
        await User.findByIdAndUpdate(userId, {
          $push: {
            blockProfiles: blockUserId,
          },
        })

        res.status(200).json({
          status: true,
          message: 'Save Profiles successfully',
          blockUserId: blockUserId,
        })
      } else {
        res
          .status(400)
          .json({ status: false, message: 'block Profiles is zero' })
      }
    } catch (error) {
      console.error('Error block profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  blacklistProfiles: async (req, res) => {
    try {
      const { bkId } = req.body

      // Update the liked user's receivedLikes array
      const exitingUser = await User.findById(bkId)

      if (exitingUser) {
        await User.findByIdAndUpdate(bkId, {
          blacklist: 'yes',
        })

        res.status(200).json({
          status: true,
          message: 'blacklist Profiles successfully',
        })
      } else {
        res
          .status(400)
          .json({ status: false, message: 'block Profiles is zero' })
      }
    } catch (error) {
      console.error('Error block profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  receviedLikes: async (req, res) => {
    try {
      const { userId } = req.params

      const likes = await User.findById(userId)
        .populate('receviedLikes', 'email imageUrls userId name userId')
        .select('receviedLikes')

      if (likes.receviedLikes.length > 0) {
        res.status(200).json({ receviedLikes: likes.receviedLikes })
        console.log('likes', likes)
      } else {
        res
          .status(200)
          .json({ status: true, message: 'you not recevied heart' })
      }
    } catch (error) {
      console.error('Error fetching received likes:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  sendLikes: async (req, res) => {
    try {
      const { userId } = req.params

      console.log('sendLikes', userId)

      const likes = await User.findById(userId)
        .populate('likedProfiles', 'email imageUrls userId name')
        .select('likedProfiles')

      res.status(200).json({ sendLikes: likes.likedProfiles })
    } catch (error) {
      console.error('Error fetching received likes:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  createMatch: async (req, res) => {
    try {
      const { userId: currentUserId, selectedUserId } = req.body
      console.log('123', currentUserId, selectedUserId)

      await User.findByIdAndUpdate(selectedUserId, {
        $push: { matches: currentUserId },
        $pull: { likedProfiles: currentUserId },
      })

      await User.findByIdAndUpdate(currentUserId, {
        $push: { matches: selectedUserId },
      })

      const newRoom = await Room({
        myId: currentUserId,
        fdId: selectedUserId,
        title: `${currentUserId}-${selectedUserId}`,
        count: 0,
      })

      newRoom.save()

      const updatedUser = await User.findByIdAndUpdate(
        currentUserId,
        {
          $pull: { receviedLikes: { userId: selectedUserId } },
        },
        { new: true }
      )

      if (!updatedUser) {
        return res
          .status(400)
          .json({ status: false, message: 'Create Match Failed' })
      } else {
        res
          .status(200)
          .json({ status: true, message: 'Create Match successfully' })
      }
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  getMatches: async (req, res) => {
    try {
      const { userId } = req.params

      // Find the user by ID and populate the matches field
      const user = await User.findById(userId).populate(
        'matches',
        'name imageUrls'
      )

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Extract matches from the user object
      const matches = user.matches

      res.status(200).json({ matches })
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: 'Get Matches error', error })
    }
  },
  getBlacklist: async (req, res) => {
    try {
      // Find the user by ID and populate the matches field
      const user = await User.find({ blacklist: 'yes' })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Extract matches from the user object

      res.status(200).json({ user })
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: 'Get blacklist error', error })
    }
  },
  getApprove: async (req, res) => {
    try {
      // Find the user by ID and populate the matches field
      const user = await User.find({ pictureVerify: 'false' })

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Extract matches from the user object

      res.status(200).json({ user })
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: 'Get Approve error', error })
    }
  },
  cancelBlacklist: async (req, res) => {
    try {
      const { bkId } = req.body

      await User.findByIdAndUpdate(bkId, {
        blacklist: 'no',
      })

      res
        .status(200)
        .json({ status: true, message: 'Cancel Blacklist successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Cancel Blacklist Error', error })
    }
  },
  uploadCardImage: async (req, res) => {
    try {
      // const { userId } = req.params

      // const user = await User.findById(userId)

      // if (!user) {
      //   return res.status(404).json({ message: 'User not found' })
      // }

      if (req.file) {
        const { url } = await cloudinaryUploadImg(req.file.path)
        //console.log('response', response)
        res.status(200).json({
          status: true,
          message: 'Card Image upload successfully',
          url: url,
        })
      } else {
        console.log('Image Upload failed')
        return res
          .status(400)
          .json({ status: false, message: 'file not found' })
      }
    } catch (error) {
      console.log(error)
      return res
        .status(500)
        .json({ status: false, message: 'image Upload failed' })
    }
  },
  uploadProfileImages: async (req, res) => {
    try {
      if (req.files) {
        console.log('req.files', req.files)
        let imageUrls = []
        for (i = 0; i < req.files.length; i++) {
          const { url } = await cloudinaryUploadImg(req.files[i].path, {
            transformation: { width: 480, crop: 'fill' },
          })
          imageUrls.push({ url: url })
          //console.log('res', res)
        }
        console.log('files', req.files)
        res.status(200).json({
          message: 'Image Upload successfully',
          imageUrls: imageUrls,
        })
      }
    } catch (error) {
      console.log('upload Images failed', error)
      res
        .status(500)
        .json({ status: fail, message: 'Upload profile images failed' })
    }
  },
  sendCancel: async (req, res) => {
    try {
      const { userId, cancelId } = req.body

      await User.findByIdAndUpdate(userId, {
        $pull: { likedProfiles: cancelId },
      })

      await User.findByIdAndUpdate(cancelId, {
        $pull: { receviedLikes: userId },
      })

      res
        .status(200)
        .json({ status: true, message: 'send like cancel successfully' })
    } catch (error) {
      console.log('sendCancel error', error)
      res.status(500).json({ status: false, message: 'send like cancel fail' })
    }
  },
  receviedCancel: async (req, res) => {
    try {
      const { userId, cancelId } = req.body

      console.log('rece cancel', userId, cancelId)

      await User.findByIdAndUpdate(userId, {
        $pull: { receviedLikes: { userId: cancelId } },
      })

      await User.findByIdAndUpdate(cancelId, {
        $pull: { likedProfiles: userId },
      })

      res
        .status(200)
        .json({ status: true, message: 'recevied like cancel successfully' })
    } catch (error) {
      console.log('sendCancel error', error)
      res.status(500).json({ status: false, message: 'send like cancel fail' })
    }
  },
  updatePrompts: async (req, res) => {
    try {
      const { questionId, userId, updateAnswer } = req.body

      await User.findOneAndUpdate(
        { _id: userId, 'prompts._id': questionId },
        {
          $set: {
            'prompts.$.answer': updateAnswer,
          },
        }
      )

      res
        .status(200)
        .json({ message: 'Question update seccessfully', status: true })
    } catch (err) {
      console.log('updatePrompts Error', err)
      res.status(500).json({ message: 'update prompts Error', status: false })
    }
  },
  updateEmail: async (req, res) => {
    try {
      const { userId, updateEmail } = req.body

      const user = await User.findByIdAndUpdate(userId, { email: updateEmail })
      if (user) {
        res
          .status(200)
          .json({ message: 'User Email Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update Email error', error)
    }
  },
  pictureTry: async (req, res) => {
    try {
      const { userId } = req.body

      const user = await User.findByIdAndUpdate(userId, {
        pictureVerify: 'false',
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'picture verify successfully', status: true })
      } else {
        res
          .status(400)
          .json({ message: 'picture verify falied', status: false })
      }
    } catch (error) {
      console.log('picture verify falied', error)
    }
  },
  pushToken: async (req, res) => {
    try {
      const { userId, pushToken } = req.body
      console.log('userId, pushToken')

      const user = await User.findByIdAndUpdate(userId, {
        pushToken: pushToken,
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'Push tokrn Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'Push tokrn not found', status: false })
      }
    } catch (error) {
      console.log('update Email error', error)
    }
  },
  updateImageUrls: async (req, res) => {
    try {
      const { userId, images } = req.body

      console.log('images', images)

      const user = await User.findByIdAndUpdate(userId, {
        imageUrls: images,
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'User ImageUrls Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update ImageUrls error', error)
    }
  },
  updateAge: async (req, res) => {
    try {
      const { userId, updateAge } = req.body

      const user = await User.findByIdAndUpdate(userId, { age: updateAge })
      if (user) {
        res
          .status(200)
          .json({ message: 'User Age Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update Age error', error)
    }
  },
  updateRegion: async (req, res) => {
    try {
      const { userId, updateRegion } = req.body

      const user = await User.findByIdAndUpdate(userId, {
        region: updateRegion,
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'User Region Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update Region error', error)
    }
  },
  updateLookingFor: async (req, res) => {
    try {
      const { userId, updateLookingFor } = req.body

      const user = await User.findByIdAndUpdate(userId, {
        lookingFor: updateLookingFor,
      })
      if (user) {
        res.status(200).json({
          message: 'User LookingFor Update successfully',
          status: true,
        })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update LookingFor error', error)
    }
  },
  updateGender: async (req, res) => {
    try {
      const { userId, updateGender } = req.body

      const user = await User.findByIdAndUpdate(userId, {
        gender: updateGender,
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'User Gender Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update Gender error', error)
    }
  },
  updateApproveTrue: async (req, res) => {
    try {
      const { userId } = req.body
      console.log('userId approve', userId)

      const user = await User.findByIdAndUpdate(userId, {
        pictureVerify: 'true',
      })

      if (user) {
        res.status(200).json({
          message: 'User Approve status Update successfully',
          status: true,
        })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update Gender error', error)
    }
  },
  updateApproveReject: async (req, res) => {
    try {
      const { userId } = req.body

      const user = await User.findByIdAndUpdate(userId, {
        pictureVerify: 'reject',
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'User Approve Reject successfully', status: true })
      } else {
        res
          .status(400)
          .json({ message: 'Approve Reject not found', status: false })
      }
    } catch (error) {
      console.log('update Approve Reject error', error)
    }
  },
  updateStatus: async (req, res) => {
    try {
      const { userId, updateStatus } = req.body

      const user = await User.findByIdAndUpdate(userId, {
        status: updateStatus,
      })
      if (user) {
        res
          .status(200)
          .json({ message: 'User Gender Update successfully', status: true })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update Gender error', error)
    }
  },
  updateHeartCount: async (req, res) => {
    try {
      const { userId, count } = req.body

      const exitingUser = await User.findById(userId)

      if (exitingUser) {
        await User.findByIdAndUpdate(userId, {
          heartCount: exitingUser.heartCount + count,
        })
        res.status(200).json({
          message: 'User HeartCount Update successfully',
          status: true,
        })
      } else {
        res.status(400).json({ message: 'User not found', status: false })
      }
    } catch (error) {
      console.log('update HeartCount error', error)
    }
  },
  secondSearch: async (req, res) => {
    try {
      const users = await User.aggregate([
        {
          $match: {
            $and: [
              {
                region: { $in: [req.body.region] },
              },
              { decade: { $in: [req.body.decade] } },
              { gender: { $ne: req.body.gender } },
            ],
          },
        },
        { $sample: { size: 3 } },
      ])

      // const users = await User.find({
      //   region: { $in: req.body.region },
      //   decade: { $in: req.body.decade },
      // })
      if (users) {
        console.log('secondSearch', users)
        res.status(200).json({ status: true, users })
      } else {
        console.log('users Error')
        res.status(400).json({ status: false, message: 'users error' })
      }
    } catch (error) {
      console.log('users Error', error)
      res.status(500).json({ status: false, message: 'user Error' })
    }
  },
  firstSearch: async (req, res) => {
    console.log('req', req.body)

    try {
      const users = await User.find({
        name: { $regex: req.body.name, $options: 'i' },
      })
      if (users) {
        console.log('firstSearch', users)
        res.status(200).json({ status: true, users })
      } else {
        console.log('first Search users Error')
        res
          .status(400)
          .json({ status: false, message: 'first Search users error' })
      }
    } catch (error) {
      console.log('first Search users Error', error)
      res
        .status(500)
        .json({ status: false, message: 'first Search user Error' })
    }
  },
  endMatch: async (req, res) => {
    try {
      const { userId, selectedUserId } = req.body
      console.log('123', userId, selectedUserId)

      await User.findByIdAndUpdate(selectedUserId, {
        $pull: { matches: userId },
      })

      await User.findByIdAndUpdate(userId, {
        $pull: { matches: selectedUserId },
      })

      res.status(200).json({ status: true, message: 'end Match successfully' })
    } catch (error) {
      console.log('end mathching', error)
      return res
        .status(500)
        .json({ status: false, message: 'end Match Error', error })
    }
  },
  getSaveProfiles: async (req, res) => {
    try {
      const { userId } = req.body

      // Find the user by ID and populate the matches field
      const user = await User.findById(userId).populate('saveProfiles')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Extract matches from the user object
      const matches = user.matches

      res.status(200).json({ matches })
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: 'Get Matches error', error })
    }
  },
  deleteSaveProfile: async (req, res) => {
    try {
      const { userId, selectedUserId } = req.body

      await User.findByIdAndUpdate(userId, {
        $pull: { saveProfiles: selectedUserId },
      })

      res
        .status(200)
        .json({ status: true, message: 'Delete Save Profiles successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  getBlockProfiles: async (req, res) => {
    try {
      const { userId } = req.body

      // Find the user by ID and populate the matches field
      const user = await User.findById(userId).populate('blockProfiles')

      if (!user) {
        return res.status(404).json({ message: 'User not found' })
      }

      // Extract matches from the user object
      const matches = user.matches

      res.status(200).json({ matches })
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: 'Get Matches error', error })
    }
  },
  deleteBlockProfile: async (req, res) => {
    try {
      const { userId, selectedUserId } = req.body

      await User.findByIdAndUpdate(userId, {
        $pull: { blockProfiles: selectedUserId },
      })

      res
        .status(200)
        .json({ status: true, message: 'Delete block Profiles successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'delete block user Error', error })
    }
  },
  sendPush: async (req, res) => {
    try {
      const { userId } = req.body

      const user = await User.findById(userId)
      console.log('useruser', user.pushToken)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          body: 'This is a test notification\n 남자3호님이 하트를 보냈습니다.',
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  createRoom: async (req, res) => {
    try {
      const { email, password } = req.body
      console.log('find password asdas', email, password)

      const hashedPassword = CryptoJS.AES.encrypt(
        password,
        process.env.SECRET_KEY
      ).toString()

      const newUser = await Room({
        email: email,
        password: hashedPassword,
      })
      newUser.save()

      res.status(200).json({ message: true })
      //const user = await User.find({ email: email })
      // if (user) {
      //   const password = bcrypt.hash(user.password, 12)
      //   console.log('password', password)
      // }
    } catch (error) {
      console.log('find password error', error)
    }
  },
  findEmail: async (req, res) => {
    try {
      const { reEmail } = req.body

      //const secretKey = CryptoJS.lib.WordArray.random(32).toString()

      const user = await User.find({ email: reEmail })
      console.log('user', user)
      if (user) {
        const bytes = CryptoJS.AES.decrypt(
          user[0].password,
          process.env.SECRET_KEY
        )
        const originalText = bytes.toString(CryptoJS.enc.Utf8)
        sendVerificationEmail(user[0].email, originalText)
        res.status(200).json({ message: true, pass: originalText })
      }
    } catch (error) {
      console.log('find password error', error)
    }
  },
  pushSendHeart: async (req, res) => {
    try {
      const { userId, myName } = req.body
      console.log('pushsehdHeart', userId, myName)

      const user = await User.findById(userId)

      if (user) {
        console.log('asdasdas', user)
        console.log('pushsehdHeart', user.pushToken)
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          title: '나혼자 솔로',
          sound: 'default',
          body: `${myName}님이 하트를 보냈습니다.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log('pushsendheart', ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushRejectHeart: async (req, res) => {
    try {
      const { userId, myName } = req.body

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          title: '나혼자 솔로',
          sound: 'default',
          body: `${myName}님이 하트를 거절했습니다.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log('push', ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushAcceptHeart: async (req, res) => {
    try {
      const { userId, myName } = req.body

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: `${myName}님이 하트를 받아들였습니다.\n 대화를 시작해보세요.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushZzim: async (req, res) => {
    try {
      const { userId, myName } = req.body

      console.log('push zzim', userId, myName)

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: `${myName}님이 당신을 찜했습니다.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushSendMessage: async (req, res) => {
    try {
      const { userId, myName } = req.body

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: `${myName}님이 메세지를 보냈습니다.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log('ticketChunk', ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushOutRoom: async (req, res) => {
    try {
      const { userId, myName } = req.body

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: ` ${myName}님이 대화방을 나갔습니다.\n 대화방이 사라집니다.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushRegister: async (req, res) => {
    try {
      const user = await User.find({ email: 'test1424@gmail.com' })

      if (user) {
        console.log('user-register-push', user)
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user[0].pushToken || !Expo.isExpoPushToken(user[0].pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user[0].pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: `가입신청이 도착했습니다. 확인해 주세요`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({
        status: true,
        message: 'send-regisgter send Push  successfully',
      })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushPictureTrue: async (req, res) => {
    try {
      const { userId, myName } = req.body

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: ` ${myName}님 가입이 승인되었습니다.\n 나혼자 솔로를 재실행 해 주세요.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  pushPictureReject: async (req, res) => {
    try {
      const { userId, myName } = req.body

      const user = await User.findById(userId)

      if (user) {
        // Check that all your push tokens appear to be valid Expo push tokens
        if (!user.pushToken || !Expo.isExpoPushToken(user.pushToken)) {
          console.error(
            `Push token ${pushToken} is not a valid Expo push token`
          )
        }
        let messages = []
        // Construct a message (see https://docs.expo.io/push-notifications/sending-notifications/)
        messages.push({
          to: user.pushToken,
          sound: 'default',
          title: '나혼자 솔로',
          body: ` ${myName}님의 가입이 거절되었습니다.\n 본인의 사진을 업로드해 주세요.`,
          data: { withSome: 'data' },
        })

        let chunks = expo.chunkPushNotifications(messages)
        //let tickets = []
        ;(async () => {
          // Send the chunks to the Expo push notification service. There are
          // different strategies you could use. A simple one is to send one chunk at a
          // time, which nicely spreads the load out over time:
          for (let chunk of chunks) {
            try {
              let ticketChunk = await expo.sendPushNotificationsAsync(chunk)
              console.log(ticketChunk)
              //tickets.push(...ticketChunk)
              // NOTE: If a ticket contains an error code in ticket.details.error, you
              // must handle it appropriately. The error codes are listed in the Expo
              // documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
            } catch (error) {
              console.error(error)
            }
          }
        })()
      }

      res.status(200).json({ status: true, message: 'send Push  successfully' })
    } catch (error) {
      console.log('errrr', error)
      return res
        .status(500)
        .json({ status: false, message: 'Create Match Error', error })
    }
  },
  paymentComplete: async (req, res) => {
    const { paymentId, orderId } = req.body
    console.log('paymentComplete', req.body)
    console.log('pa', paymentId, orderId)
    res.status(200).json({ message: 'payment success' })
  },
  createOrder: async (req, res) => {
    try {
      const { userId, price, count } = req.body

      const newOrder = await Order({
        userId: userId,
        price: price,
        count: count,
      })

      newOrder.save()

      res.status(200).json({ message: 'Order create successfully' })
      //const user = await User.find({ email: email })
      // if (user) {
      //   const password = bcrypt.hash(user.password, 12)
      //   console.log('password', password)
      // }
    } catch (error) {
      console.log('create Order Error', error)
    }
  },
  getOrder: async (req, res) => {
    try {
      const { userId } = req.body
      console.log('orderUser', userId)
      // Find the user by ID and populate the matches field
      const order = await Order.find({ userId: userId })

      if (!order) {
        return res.status(404).json({ message: 'User not found' })
      } else {
        console.log('order', order)
        res.status(200).json({ order: order, message: 'order send' })
      }

      // Extract matches from the user object
    } catch (error) {
      res.status(500).json({ status: false, message: 'getOrder error', error })
    }
  },
  deleteId: async (req, res) => {
    try {
      const { userId } = req.body

      const user = await User.findById(userId)

      if (user) {
        await User.findByIdAndDelete(userId)
      } else {
        return res.status(404).json({ message: 'User not found' })
      }

      res.status(200).json({ status: true, message: 'User deleted' })

      // Extract matches from the user object
    } catch (error) {
      res
        .status(500)
        .json({ status: false, message: 'User delete error', error })
    }
  },
}
