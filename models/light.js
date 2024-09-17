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
  lightPurpose: { type: String },
  manWomen: { type: String },
  lightRegion: { type: String },
  timeData: { type: Date, default: Date.now },
})

const Light = mongoose.model('Light', lightSchema)

module.exports = Light
