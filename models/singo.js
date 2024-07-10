const mongoose = require('mongoose')

const singoSchema = new mongoose.Schema({
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
  imageUrl: [
    {
      type: String,
    },
  ],
  reply: { type: String },

  timeData: { type: Date, default: Date.now },
})

const Singo = mongoose.model('Singo', singoSchema)

module.exports = Singo
