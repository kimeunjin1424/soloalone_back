const express = require('express')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const app = express()
const cors = require('cors')
const jwt = require('jsonwebtoken')
const Chat = require('./models/message')

dotenv.config()

//const port = 5000

const http = require('http').createServer(app)
const io = require('socket.io')(http)

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())

const userRouter = require('./routes/userRouter')
const messageRouter = require('./routes/messageRouter')
const lightRouter = require('./routes/lightRouter')
const jobRouter = require('./routes/jobRouter')
const singoRouter = require('./routes/singoRouter')
const suggestRouter = require('./routes/suggestRouter')
const roomRouter = require('./routes/roomRouter')

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('DB Connected')
  })
  .catch((error) => {
    console.log('Error connect DB', error)
  })

app.use('/api/user', userRouter)
app.use('/api/message', messageRouter)
app.use('/api/light', lightRouter)
app.use('/api/job', jobRouter)
app.use('/api/singo', singoRouter)
app.use('/api/suggest', suggestRouter)
app.use('/api/room', roomRouter)

let activeUser = []
let chatGroups = []

const addUser = (userId, socketId) => {
  const checkUser = activeUser.some((u) => u.userId === userId)
  //true, false 로 찍힘ㄴㅇㄹ
  console.log('checkUser', checkUser)

  //새로고침을 했을떄, 변한 소켓id를 재입력 해주는 것으로 매우매우 중요함
  if (!checkUser) {
    activeUser.push({ userId, socketId })
  } else {
    const target = activeUser.find((u) => u.userId === userId)
    //console.log('index', target)
    const data = { userId, socketId }
    if (target) {
      //console.log('update')
      Object.assign(target, data)
      //console.log('sasdasd', target, data)
    }
    // console.log('users', activeUser)
  }
}

const findFirend = (id) => {
  return activeUser.find((u) => u.userId === id)
}

io.on('connection', (socket) => {
  console.log(`socket ${socket.id} is connected`)

  socket.on('addUser', (userId) => {
    console.log('addUser Emait userId', userId)
    //client에서 emit 되는 부분, connect되면 바로 emit함.
    // socket.on('connect', () => {
    //     console.log('Connected to socket')
    //     if (userId) socket.emit('addUser', userId)
    //   })

    addUser(userId, socket.id)
    console.log('activeUSer', activeUser)

    // const us = users.filter((u) => u.userId !== userId)
    // const con = 'new_user_add'

    // for (var i = 0; i < us.length; i++) {
    //   socket.to(us[i].socketId).emit('new_user_add', con)
    // }
  })

  // socket.on('sendMessage', (message) => {
  //   // console.log('socketMessage', message)
  //   // console.log('recepientId', message.senderId)
  //   //console.log('message', message)
  //   const user = findFirend(message.recepientId)
  //   //console.log('receiveUser', user.socketId)
  //   if (user) {
  //     socket.to(user.socketId).emit('getMessage', {
  //       senderId: { _id: message.senderId, name: user.user.name },
  //       recepientId: message.recepientId,
  //       message: message.messageText,
  //       messageType: 'text',
  //       timeStamp: new Date(),
  //       //_id: message._id,
  //     })

  //     //console.log('user found')
  //   } else {
  //     console.log('user not connected')
  //   }
  // })
  socket.on('pushControllRere', async (data) => {
    //console.log('push controllRere data', data)
    try {
      const user = findFirend(data.userId)
      if (user) {
        socket.to(user.socketId).emit('pushControllRere', data)
      }
    } catch (error) {
      console.log('push sokcet Error', error)
    }
  })

  socket.on('pushControll', async (data) => {
    //console.log('push controll data', data)
    try {
      const user = findFirend(data.receviedId)
      if (user) {
        socket.to(user.socketId).emit('pushControllRe', data)
      }
    } catch (error) {
      console.log('push sokcet Error', error)
    }
  })

  socket.on('sendMessage', async (data) => {
    try {
      console.log('rerecevied messsage', data)
      const user = findFirend(data.receviedId)

      if (user) {
        socket.to(user.socketId).emit('receviedMessage', data)
      }
    } catch (error) {
      console.log('Error handling the Message')
    }
  })

  socket.on('forceDisconnect', function (data) {
    const user = findFirend(data.receviedId)
    if (user) {
      socket.to(user.socketId).emit('pushTrue', data)
    }
    socket.disconnect(true)
    console.log('socket disconnected')
    console.log('data disconnected', data)
    activeUser.filter((i) => i.userId !== data.userId)
    console.log('activeUser', activeUser)
  })
})

http.listen(process.env.PORT, () => {
  console.log(`Server is Running ${process.env.PORT}`)
})
