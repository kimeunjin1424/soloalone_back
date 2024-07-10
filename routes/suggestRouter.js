const router = require('express').Router()
const suggestController = require('../controllers/suggestController')

//const { photoUpload } = require('../utils/photoUpload')
const Suggest = require('../models/suggest')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.post('/create-suggest', suggestController.createSuggest)
router.post('/get-suggests', suggestController.getSuggests)
router.post('/get-suggest', suggestController.getSuggest)
router.post('/delete-suggest', suggestController.deleteSuggest)
router.put('/suggest-reply', suggestController.suggestReply)

module.exports = router
