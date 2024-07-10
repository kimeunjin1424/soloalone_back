const router = require('express').Router()
const userController = require('../controllers/userController')
const multer = require('multer')
//const sharp = require('sharp')
const path = require('path')
//storage
const multerStorage = multer.diskStorage({})

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
  limits: { fieldSize: 5 * 1024 * 1024 * 1024 },
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
  '/upload-profile-images',
  photoUpload.array('images'),
  userController.uploadProfileImages
)
router.put('/update-prompts', userController.updatePrompts)
router.put('/update-email', userController.updateEmail)
router.put('/update-imageUrls', userController.updateImageUrls)
router.put('/update-age', userController.updateAge)
router.put('/update-region', userController.updateRegion)
router.put('/update-lookingFor', userController.updateLookingFor)
router.put('/update-gender', userController.updateGender)
router.put('/update-status', userController.updateStatus)
router.put('/update-heartCount', userController.updateHeartCount)
router.post('/second-search', userController.secondSearch)
router.post('/first-search', userController.firstSearch)
router.post('/end-match', userController.endMatch)
router.post('/save-profiles', userController.saveProfiles)
router.post('/get-save-profiles', userController.getSaveProfiles)
router.post('/delete-save-profile', userController.deleteSaveProfile)

module.exports = router
