const multer = require('multer')
//const sharp = require('sharp')
const path = require('path')
//storage
const multerStorage = multer.diskStorage({})

//file type checking
const multerFilter = (req, file, cb) => {
  //check file type
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    //rejected files
    cb(
      {
        message: 'Unsupported file format',
      },
      false
    )
  }
}

const photoUpload = multer({
  limits: { fieldSize: 5 * 1024 * 1024 * 1024 },
  storage: multerStorage,
  fileFilter: multerFilter,
  limits: { fileSize: 10000000000 },
})

export const cloudinaryUploadImg = async (fileToUpload) => {
  try {
    const data = await cloudinary.v2.uploader.upload(fileToUpload, {
      resource_type: 'auto',
    })
    console.log('data', data)
    return {
      url: data?.secure_url,
    }
  } catch (error) {
    return error
  }
}

router.post('/image-upload', photoUpload.array('file'), async (req, res) => {
  try {
    //console.log('req', req)
    if (req.files) {
      console.log('file', req.files)

      if (req.files) {
        //for문 사용하자
        let photo = []
        for (let i = 0; i < req.files.length; i++) {
          const { url, public_id } = await cloudinaryUploadImg(
            req.files[i].path
          )
          photo.push({ url, public_id })
        }
        console.log('multipleImages', photo)
        //res.json(photo)
      }
    } else {
      console.log('Image Upload failed1111')
      return res.status(400).json({ status: false, message: 'file not found' })
    }
    return res
      .status(200)
      .json({ status: true, message: 'image upload successfully' })
  } catch (error) {
    console.log(error)
    return res
      .status(500)
      .json({ status: false, message: 'image Upload failed' })
  }
})

module.exports = { photoUpload }
