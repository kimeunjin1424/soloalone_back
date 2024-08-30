const mongoose = require('mongoose')
const Schema = mongoose.Schema

const userSchema = new Schema({
  name: {
    type: String,
    //required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  gender: {
    type: String,
    //required: true,
  },
  dateOfBirth: {
    type: String,
    //required: true,
  },
  type: {
    type: String,
    //required: true,
  },
  region: {
    type: String,
    //required: true,
  },
  age: { type: String },
  hometown: {
    type: String,
    //required: true,
  },
  datingPreferences: [{ type: String }],
  lookingFor: { type: String },
  cardImage: {
    type: String,
    default:
      'https://cdn.pixabay.com/photo/2016/03/07/09/34/kid-1241817_1280.jpg',
  },
  imageUrls: [
    {
      type: String,
    },
  ],
  prompts: [
    {
      question: {
        type: String,
      },
      answer: {
        type: String,
      },
    },
  ],
  likedProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  receviedLikes: [
    {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      image: { type: String },
      comment: { type: String },
      name: { type: String },
    },
  ],
  saveProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  blockProfiles: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  matches: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  lastLogin: { type: Date, default: Date.now },
  lastActive: { type: Date, default: Date.now },
  visibility: { type: String, enum: ['public', 'hidden'], default: 'public' },
  notificationPerferences: {},
  heartCount: { type: Number },
  receviedHeartCount: { type: Number, default: 0 },
  decade: { type: String },
  location: {
    lat: { type: String },
    lng: { type: String },
  },
  status: { type: String, enum: ['solo', 'couple'], default: 'solo' },
  blacklist: { type: String, enum: ['no', 'yes'], default: 'no' },
  jobVerify: {
    jobName: { type: String },
    imageUrl: { type: String },
    verify: { type: String, default: 'false' },
  },
  aggrement: { type: String, default: 'false' },
  admin: { type: String, default: 'false' },
  pushToken: { type: String },
})

const User = mongoose.model('User', userSchema)

module.exports = User
