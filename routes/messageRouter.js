const router = require('express').Router()
const messageController = require('../controllers/messageController')
const userController = require('../controllers/messageController')
//const { photoUpload } = require('../utils/photoUpload')
const Chat = require('../models/message')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.get('/:senderId/:receviedId', messageController.getMessages)
router.post('/create-message', messageController.createMessage)
router.post('/create-images', messageController.createImage)
router.post('/message-seen', messageController.messageSeen)

module.exports = router
