const router = require('express').Router()
const lightController = require('../controllers/lightController')

//const { photoUpload } = require('../utils/photoUpload')
const Light = require('../models/light')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.post('/', lightController.getLight)
router.post('/create-light', lightController.createLight)
router.post('/delete-light', lightController.deleteLight)
router.post('/search', lightController.searchLight)

module.exports = router
