const router = require('express').Router()
const singoController = require('../controllers/singoController')

//const { photoUpload } = require('../utils/photoUpload')
const Singo = require('../models/singo')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.post('/create-singo', singoController.createSingo)
router.get('/get-singos', singoController.getSingos)
router.post('/get-singo', singoController.getSingo)
router.post('/delete-singo', singoController.deleteSingo)
router.put('/singo-reply', singoController.singoReply)

module.exports = router
