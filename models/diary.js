const mongoose = require('mongoose')

const diarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  username: {
    type: String,
  },
  userImage: {
    type: String,
  },
  likedId: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      image: { type: String },
      region: { type: String },
      name: { type: String },
    },
  ],
  reply: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      image: { type: String },
      name: { type: String },
      region: { type: String },
      content: { type: String, required: true },
      replyDate: { type: String },
      timeData: { type: Date, default: Date.now },
    },
  ],
  content: {
    type: String,
    requured: true,
  },
  lonely: { type: Number },
  imageUrls: [{ type: String }],
  writeDay: {
    type: String,
  },
  region: {
    type: String,
  },
  createdAt: { type: Date, default: Date.now },
})

const Diary = mongoose.model('Diary', diarySchema)

module.exports = Diary
