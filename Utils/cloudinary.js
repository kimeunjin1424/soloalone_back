const cloudinary = require('cloudinary')
const dotenv = require('dotenv')
dotenv.config()

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true,
})

const cloudinaryUploadImg = async (fileToUpload) => {
  try {
    const data = await cloudinary.v2.uploader.upload(fileToUpload, {
      transformation: [{ width: 600, crop: 'fill' }],
      resource_type: 'auto',
    })
    return {
      url: data?.secure_url,
    }
  } catch (error) {
    return error
  }
}

module.exports = cloudinaryUploadImg
