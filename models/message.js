const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receviedId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  messageType: {
    type: String,
    enum: ['text', 'image', 'emoji'],
  },
  message: { type: String },
  imageUrls: [{ type: String }],
  status: { type: String, default: 'unseen' },
  timeData: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
})

const Chat = mongoose.model('Chat', chatSchema)

module.exports = Chat
