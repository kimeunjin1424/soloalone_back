const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  price: { type: Number },
  count: { type: Number },
  timeData: { type: Date, default: Date.now },
})

const Order = mongoose.model('Order', orderSchema)

module.exports = Order
