const router = require('express').Router()
const jobController = require('../controllers/jobController')

//const { photoUpload } = require('../utils/photoUpload')
const job = require('../models/light')
//const cloudinaryUploadImg = require('../utils/cloudinary')

router.post('/job-verify', jobController.createJobVerify)
router.get('/get-jobs', jobController.getJobs)
router.post('/verify-job', jobController.verifyJob)

module.exports = router
