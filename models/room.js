const mongoose = require('mongoose')

const roomSchema = new mongoose.Schema({
  myId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fdId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: {
    type: String,
  },
  count: { type: Number, default: 0 },
  email: { type: String },
  password: { type: String },
  timeData: { type: Date, default: Date.now },
})

const Room = mongoose.model('Room', roomSchema)

module.exports = Room
