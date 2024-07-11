const Singo = require('../models/singo')

module.exports = {
  createSingo: async (req, res) => {
    try {
      const { userId, text, username, imageUrl } = req.body

      const newSingo = new Singo({
        userId,
        text,
        username,
        imageUrl,
      })
      await newSingo.save()

      res
        .status(200)
        .json({ status: true, messsage: 'create Singo successfully' })
    } catch (error) {
      console.log('create Light Error', error)
      res.status(500).json({ status: false, message: 'create Singo error' })
    }
  },
  getSingos: async (req, res) => {
    try {
      const singo = await Singo.find({})

      res.status(200).json({ singo: singo, status: true })
    } catch (error) {
      console.log('get Singo Error', error)
    }
  },
  getSingo: async (req, res) => {
    try {
      const { userId } = req.body
      console.log('getSingo', userId)
      const singo = await Singo.find({ userId: userId })

      res.status(200).json({ singo: singo, status: true })
    } catch (error) {
      console.log('get Singo Error', error)
    }
  },
  deleteSingo: async (req, res) => {
    const { singoId } = req.body

    console.log('deded', req.body)
    try {
      await Singo.findByIdAndDelete(singoId)

      res.status(200).json({ message: 'suggest delete success', status: true })
    } catch (error) {
      console.log('get Light Error', error)
    }
  },

  singoReply: async (req, res) => {
    console.log('req', req.body)

    try {
      const { singoId, reply } = req.body
      const updatedSingo = await Singo.findByIdAndUpdate(singoId, {
        reply: reply,
      })
      if (updatedSingo) {
        //console.log('secondSearch', users)
        res.status(200).json({ status: true, updatedSingo })
      } else {
        console.log('search light Error')
        res.status(400).json({ status: false, message: 'search light error' })
      }
    } catch (error) {
      console.log('users Error', error)
      res.status(500).json({ status: false, message: 'search light Error' })
    }
  },
}
