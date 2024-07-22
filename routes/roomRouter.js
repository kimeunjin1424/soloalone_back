const router = require('express').Router()
const roomController = require('../controllers/roomController')

//const { photoUpload } = require('../utils/photoUpload')
const job = require('../models/light')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.post('/find-room', roomController.findRoom)
router.put('/update-count', roomController.updateCount)
router.post('/decrease-count', roomController.decreaseCount)
router.post('/delete-room', roomController.deleteRoom)

module.exports = router
