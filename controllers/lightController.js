const Light = require('../models/light')

module.exports = {
  createLight: async (req, res) => {
    try {
      const {
        userId,
        username,
        region,
        timeData,
        imageUrl,
        lightPurpose,
        manWomen,
        lightRegion,
        location,
      } = req.body

      const newLight = new Light({
        userId,
        username,
        region,
        timeData,
        imageUrl,
        location,
        lightPurpose,
        manWomen,
        lightRegion,
      })
      await newLight.save()

      res
        .status(200)
        .json({ status: true, messsage: 'create light successfully' })
    } catch (error) {
      console.log('create Light Error', error)
      res.status(500).json({ status: false, message: 'create Light error' })
    }
  },

  getLight: async (req, res) => {
    try {
      // const users = await User.find({
      //   gender: { $ne: req.body.gender },
      //   _id: { $ne: req.body.userId },
      //   region: { $in: req.body.region },
      // })
      const light = await Light.find({ region: { $in: req.body.region } })

      res.status(200).json({ light: light, status: true })
    } catch (error) {
      console.log('get Light Error', error)
    }
  },
  deleteLight: async (req, res) => {
    const { deleteId } = req.body
    console.log('deded', req.body)
    try {
      await Light.findByIdAndDelete(deleteId)

      res.status(200).json({ message: 'delete success', status: true })
    } catch (error) {
      console.log('get Light Error', error)
    }
  },
  searchLight: async (req, res) => {
    console.log('req', req.body)

    try {
      const light = await Light.find({
        region: { $in: req.body.region },
      })
      if (light) {
        //console.log('secondSearch', users)
        res.status(200).json({ status: true, light })
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
