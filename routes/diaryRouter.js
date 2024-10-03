const router = require('express').Router()
const diaryController = require('../controllers/diaryController')

//const { photoUpload } = require('../utils/photoUpload')
const Diary = require('../models/singo')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.post('/create-diary', diaryController.createDiary)
router.get('/get-diarys', diaryController.getDiarys)
router.post('/get-user-diary', diaryController.getUserDiary)
router.post('/delete-diary', diaryController.deleteDiary)
router.put('/diary-reply', diaryController.diaryReply)
router.put('/click-Heart', diaryController.clickHeart)
router.post('/input-diaryId', diaryController.inputDiaryId)

module.exports = router
