const Room = require('../models/room')

module.exports = {
  findRoom: async (req, res) => {
    try {
      const { senderId, receviedId } = req.body

      console.log('findRoom', senderId, receviedId)
      const room = await Room.findOne({
        $or: [
          {
            myId: senderId,
            fdId: receviedId,
          },
          {
            myId: receviedId,
            fdId: senderId,
          },
        ],
      })

      console.log('room', room)
      res
        .status(200)
        .json({ status: true, room: room, message: 'find Room true' })
    } catch (error) {
      console.log('findRoom Error', error)
    }
  },

  updateCount: async (req, res) => {
    try {
      const { roomId } = req.body
      const room = await Room.findById(roomId)

      if (room) {
        await Room.findByIdAndUpdate(roomId, {
          count: room.count + 1,
        })
      }

      res.status(200).json({
        room: room,
        status: true,
        message: 'room count update successfully',
      })
    } catch (error) {
      console.log('room count Error', error)
    }
  },
  decreaseCount: async (req, res) => {
    console.log('dededededed', req.body)
    try {
      const { roomId } = req.body
      const room = await Room.find({ _id: roomId })

      console.log('decreaser RoomId', roomId)
      console.log('decrease Room', room)

      if (room) {
        console.log('decreaer asdasdas')
        await Room.findByIdAndUpdate(roomId, {
          count: room.count - 1,
        })
      } else {
        console.log('can not fiund room')
      }

      res.status(200).json({
        room: room,
        status: true,
        message: 'decrease count update successfully',
      })
    } catch (error) {
      console.log('decrease count Error', error)
    }
  },
  deleteRoom: async (req, res) => {
    const { userId, jobName, jobId } = req.body

    try {
      await User.findByIdAndUpdate(userId, {
        jobVerify: { verify: true, jobName: jobName },
      })

      await Job.findByIdAndUpdate(jobId, {
        verify: 'true',
      })

      res.status(200).json({ message: 'job Verify success', status: true })
    } catch (error) {
      console.log('get Light Error', error)
    }
  },
}
