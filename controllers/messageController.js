const Chat = require('../models/message')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')

module.exports = {
  createMessage: async (req, res) => {
    try {
      console.log(req.body)
      const {
        userId: senderId,
        receviedId,
        message,
        timeData,
        messageType,
      } = req.body

      const newMessage = new Chat({
        senderId,
        receviedId,
        message,
        timeData,
        messageType,
      })
      await newMessage.save()

      res
        .status(200)
        .json({ status: true, messsage: 'create message successfully' })
    } catch (error) {
      console.log('createMessage Error', error)
      res.status(500).json({ status: false, message: 'create MEssage error' })
    }
  },
  createImage: async (req, res) => {
    try {
      //console.log('finalImages', req.body)
      const {
        userId: senderId,
        receviedId,
        imageUrls,
        timeData,
        messageType,
      } = req.body

      const newMessage = new Chat({
        senderId,
        receviedId,
        imageUrls,
        timeData,
        messageType,
      })
      await newMessage.save()

      res
        .status(200)
        .json({ status: true, messsage: 'create Image successfully' })
    } catch (error) {
      console.log('create Image Error', error)
      res.status(500).json({ status: false, message: 'create Image error' })
    }
  },
  getMessages: async (req, res) => {
    try {
      const { senderId, receviedId } = req.params

      console.log('message', senderId, receviedId)
      const messages = await Chat.find({
        $or: [
          {
            senderId: senderId,
            receviedId: receviedId,
          },
          {
            senderId: receviedId,
            receviedId: senderId,
          },
        ],
      }).populate('senderId', '_id name')

      res.status(200).json(messages)
    } catch (error) {
      console.log('getMessage Error', error)
    }
  },
  messageSeen: async (req, res) => {
    try {
      const { userId, receviedId } = req.body

      console.log('userId, receviedId', userId, receviedId)
      const messages = await Chat.find({
        $or: [
          {
            senderId: userId,
            receviedId: receviedId,
          },
          {
            senderId: receviedId,
            receviedId: userId,
          },
        ],
      }).populate('senderId', '_id name')

      if (messages) {
        for (i = 0; i < messages.length; i++) {
          await Chat.findByIdAndUpdate(messages[i]._id, {
            status: 'seen',
          })
        }
      }

      res.status(200).json({ status: true, message: 'Message update true' })
    } catch (error) {
      console.log('message Update Error', error)
    }
  },
}
