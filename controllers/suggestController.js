const Suggest = require('../models/suggest')

module.exports = {
  createSuggest: async (req, res) => {
    try {
      const { userId, text, username } = req.body

      const newSuggest = new Suggest({
        userId,
        text,
        username,
      })
      await newSuggest.save()

      res
        .status(200)
        .json({ status: true, messsage: 'create suggest successfully' })
    } catch (error) {
      console.log('create Light Error', error)
      res.status(500).json({ status: false, message: 'create Light error' })
    }
  },
  getSuggests: async (req, res) => {
    try {
      const suggests = await Suggest.find({})

      res.status(200).json({ suggests: suggests, status: true })
    } catch (error) {
      console.log('get Singo Error', error)
    }
  },
  getSuggest: async (req, res) => {
    try {
      const { userId } = req.body
      const suggest = await Suggest.find({ userId: userId })
      res.status(200).json({ suggest: suggest, status: true })
    } catch (error) {
      console.log('get Singo Error', error)
    }
  },
  deleteSuggest: async (req, res) => {
    const { suggestId } = req.body
    console.log('deded', req.body)
    try {
      await Suggest.findByIdAndDelete(suggestId)

      res.status(200).json({ message: 'suggest delete success', status: true })
    } catch (error) {
      console.log('get Light Error', error)
    }
  },

  suggestReply: async (req, res) => {
    console.log('req', req.body)

    try {
      const { suggestId, reply } = req.body
      const updatedSuggest = await Suggest.findByIdAndUpdate(suggestId, {
        reply: reply,
      })
      if (updatedSuggest) {
        //console.log('secondSearch', users)
        res.status(200).json({ status: true, updatedSuggest })
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
