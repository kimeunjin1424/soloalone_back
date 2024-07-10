const Job = require('../models/job')
const User = require('../models/user')

module.exports = {
  createJobVerify: async (req, res) => {
    try {
      const { userId, username, jobName, imageUrls, comment } = req.body

      const newJob = new Job({
        userId,
        username,
        jobName,
        imageUrls,
        comment,
      })
      await newJob.save()

      res
        .status(200)
        .json({ status: true, messsage: 'create job verify successfully' })
    } catch (error) {
      console.log('create Light Error', error)
      res.status(500).json({ status: false, message: 'create Light error' })
    }
  },

  getJobs: async (req, res) => {
    try {
      const job = await Job.find({ verify: { $ne: 'true' } })

      res.status(200).json({ job: job, status: true })
    } catch (error) {
      console.log('get Job Error', error)
    }
  },
  verifyJob: async (req, res) => {
    const { userId, jobName, jobId } = req.body

    try {
      await User.findByIdAndUpdate(userId, {
        jobVerify: { verify: true, jobName: jobName },
      })

      await Job.findByIdAndUpdate(jobId, {
        verify: 'true',
      })

      res.status(200).json({ message: 'job Verify success', status: true })
    } catch (error) {
      console.log('get Light Error', error)
    }
  },
}
