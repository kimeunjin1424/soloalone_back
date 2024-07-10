const mongoose = require('mongoose')

const suggestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
  },
  username: {
    type: String,
  },
  reply: {
    type: String,
  },

  timeData: { type: Date, default: Date.now },
})

const Suggest = mongoose.model('Suggest', suggestSchema)

module.exports = Suggest
