const Diary = require('../models/diary')
const User = require('../models/user')

//userId, content, imageUrls, timeData,lonely
module.exports = {
  createDiary: async (req, res) => {
    console.log(req.body)
    try {
      const {
        userId,
        username,
        userImage,
        content,
        imageUrls,
        year,
        month,
        day,
        lonely,
        region,
      } = req.body

      const newDiary = new Diary({
        userId,
        content,
        imageUrls,
        writeDay: `${year}년${month}월${day}일`,
        lonely,
        username,
        region,
        userImage,
      })
      await newDiary.save()

      res.status(200).json({
        status: true,
        messsage: 'create diarty successfully',
        diaryId: newDiary._id,
      })
    } catch (error) {
      console.log('create Light Error', error)
      res.status(500).json({ status: false, message: 'create Diary error' })
    }
  },
  getDiarys: async (req, res) => {
    try {
      const diarys = await Diary.find({})

      res.status(200).json({ diarys: diarys, status: true })
    } catch (error) {
      console.log('get Diarys Error', error)
    }
  },
  getUserDiary: async (req, res) => {
    try {
      const { userId } = req.body
      const diary = await Diary.find({ userId: userId })
      res.status(200).json({ diary: diary, status: true })
    } catch (error) {
      console.log('get User Diary Error', error)
    }
  },

  deleteDiary: async (req, res) => {
    const { diaryId } = req.body
    console.log('delete Diary Id', req.body)
    try {
      await Diary.findByIdAndDelete(diaryId)

      res.status(200).json({ message: 'Diary delete success', status: true })
    } catch (error) {
      console.log('delete Diary Error', error)
    }
  },

  diaryReply: async (req, res) => {
    try {
      const { diaryId, userId, image, name, region, content, timeData } =
        req.body
      const reply = { userId, image, name, region, content, timeData }
      const diary = await Diary.findByIdAndUpdate(diaryId)

      if (diary) {
        //console.log('secondSearch', users)
        diary.reply.push(reply)
        diary.save()
        res.status(200).json({ status: true, message: 'create reply true' })
      } else {
        console.log('create Diary reply Error')
        res
          .status(400)
          .json({ status: false, message: 'create Diary reply Error' })
      }
    } catch (error) {
      console.log('users Error', error)
      res
        .status(500)
        .json({ status: false, message: 'create Diary reply Error' })
    }
  },
  clickHeart: async (req, res) => {
    try {
      const { diaryId, userId, image, region, name } = req.body

      // Update the liked user's receivedLikes array
      const exitingUser = await User.findById(userId)
      const diary = await Diary.findById(diaryId)
      //const existingDiary = await Diary.find({ likedId: userId })
      //console.log('existDiary', existingDiary)
      //console.log('existUser', exitingUser)

      if (exitingUser) {
        const isExist = diary.likedId.some((f) => f.userId == userId)
        if (!isExist) {
          await Diary.findByIdAndUpdate(diaryId, {
            $push: {
              likedId: { userId, image, region, name },
            },
          })
          res.status(200).json({
            status: true,
            message: 'liked Diary successfully',
          })
        } else {
          console.log('liked Already')
          res.status(200).json({
            status: false,
            message: 'liked Already',
          })
        }
      } else {
        res
          .status(400)
          .json({ status: false, message: 'User not fonud. liked Diary' })
      }
    } catch (error) {
      console.error('Error liking profile:', error)
      res.status(500).json({ message: 'Internal server error' })
    }
  },
  inputDiaryId: async (req, res) => {
    {
      try {
        const { diaryId, userId } = req.body

        await User.findByIdAndUpdate(userId, {
          $push: { diary: diaryId },
        })

        res
          .status(200)
          .json({ status: true, message: 'Input DiaryId successfully' })
      } catch (error) {
        console.log('errrr', error)
        return res
          .status(500)
          .json({ status: false, message: 'Input DiaryId Error', error })
      }
    }
  },
}
