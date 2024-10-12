const router = require('express').Router()
const userController = require('../controllers/userController')
const multer = require('multer')
//const sharp = require('sharp')
const path = require('path')
//storage
const multerStorage = multer.diskStorage({})
const sharp = require('sharp')

//file type checking
const multerFilter = (req, file, cb) => {
  //check file type
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    //rejected files
    cb(
      {
        message: 'Unsupported file format',
      },
      false
    )
  }
}

const photoUpload = multer({
  limits: { fieldSize: 5 * 10240 * 10240 * 10240 },
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10000000000 },
})

router.post('/register', userController.register)
router.post('/get-friends', userController.getFriends)
router.post('/user-profile', userController.getUser)
router.post('/login', userController.login)
router.get('/matches', userController.getUsers)
router.post('/api-users', userController.apiUser)
router.post('/like-profile', userController.likeProfile)
router.get('/recevied-likes/:userId', userController.receviedLikes)
router.get('/send-likes/:userId', userController.sendLikes)
router.post('/create-match', userController.createMatch)
router.post('/send-cancel', userController.sendCancel)
router.post('/recevied-cancel', userController.receviedCancel)
router.get('/get-matches/:userId', userController.getMatches)
router.post('/email-verify', userController.emailVerify)
router.post(
  '/upload-card-image',
  photoUpload.single('image'),
  userController.uploadCardImage
)
router.post(
  '/upload-ai-image',
  photoUpload.single('image'),
  userController.uploadAiImage
)
router.post(
  '/upload-manga-image',
  photoUpload.single('image'),
  userController.uploadMangaImage
)
router.post(
  '/upload-profile-images',
  photoUpload.array('images'),
  userController.uploadProfileImages
)
router.post(
  '/upload-cartoon-image',
  // photoUpload.single('image'),
  userController.uploadCatoonImage
)
router.put('/update-prompts', userController.updatePrompts)
router.put('/update-email', userController.updateEmail)
router.put('/update-pushToken', userController.pushToken)
router.put('/update-imageUrls', userController.updateImageUrls)
router.put('/update-age', userController.updateAge)
router.put('/update-pictureTry', userController.pictureTry)
router.put('/update-region', userController.updateRegion)
router.put('/update-lookingFor', userController.updateLookingFor)
router.put('/update-gender', userController.updateGender)
router.put('/update-approve-true', userController.updateApproveTrue)
router.put('/update-approve-reject', userController.updateApproveReject)
router.put('/update-status', userController.updateStatus)
router.put('/update-heartCount', userController.updateHeartCount)
router.post('/second-search', userController.secondSearch)
router.post('/first-search', userController.firstSearch)
router.post('/end-match', userController.endMatch)
router.post('/save-profiles', userController.saveProfiles)
router.post('/block-profiles', userController.blockProfiles)
router.post('/blacklist-profiles', userController.blacklistProfiles)
router.post('/get-save-profiles', userController.getSaveProfiles)
router.post('/delete-save-profile', userController.deleteSaveProfile)
router.post('/get-block-profiles', userController.getBlockProfiles)
router.post('/delete-block-profile', userController.deleteBlockProfile)
router.post('/send-push', userController.sendPush)
router.post('/find-email', userController.findEmail)
router.post('/create-room', userController.createRoom)
router.post('/push-send-heart', userController.pushSendHeart)
router.post('/push-reject-heart', userController.pushRejectHeart)
router.post('/push-accept-heart', userController.pushAcceptHeart)
router.post('/push-zzim', userController.pushZzim)
router.post('/push-send-message', userController.pushSendMessage)
router.post('/push-out-room', userController.pushOutRoom)
router.post('/push-register', userController.pushRegister)
router.post('/push-picture-true', userController.pushPictureTrue)
router.post('/push-picture-reject', userController.pushPictureReject)
router.post('/payment-complete', userController.paymentComplete)
router.get('/blacklist', userController.getBlacklist)
router.get('/approve', userController.getApprove)
router.post('/cancel-blacklist', userController.cancelBlacklist)
router.post('/create-order', userController.createOrder)
router.post('/get-order', userController.getOrder)
router.post('/delete-id', userController.deleteId)
// diary

module.exports = router
