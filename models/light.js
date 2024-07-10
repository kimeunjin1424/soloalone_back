const mongoose = require('mongoose')

const lightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  meetingLocation: {
    type: String,
  },
  username: {
    type: String,
  },

  region: {
    type: String,
  },
  imageUrl: {
    type: String,
  },
  location: { lat: { type: String }, lng: { type: String } },
  timeData: { type: Date, default: Date.now },
})

const Chat = mongoose.model('Light', lightSchema)

module.exports = Chat
