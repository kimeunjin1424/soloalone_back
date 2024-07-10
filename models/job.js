const mongoose = require('mongoose')

const jobSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
  },
  jobName: {
    type: String,
  },
  verify: {
    type: String,
    default: 'false',
  },
  imageUrls: [
    {
      type: String,
    },
  ],
  comment: {
    type: String,
  },
  reComment: {
    type: String,
  },
  timeData: { type: Date, default: Date.now },
})

const Job = mongoose.model('Job', jobSchema)

module.exports = Job
