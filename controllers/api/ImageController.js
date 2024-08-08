import { ImageModel } from '../../models/imageModel.js'

export class ImageController {
  async getImages (req, res, next) {
 
  }

  async getImage (req, res, next) {
 
  }

  /**
   * Method to create a new image, store the image data in the resource service and forward the image to the image service.
   * 
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async createImage (req, res, next) {
    // Create a new image containing the data from the request body (base64-encoded image data, title, description, user-id).

    console.log('In createImage')

    // Create an image object to send to the image service.
    const image = {
      data: req.body.data,
      contentType: req.body.contentType,
      description: req.body.description,
      location: req.body.location,
    }

    // Testing, remove later.
    console.log('Image:', image)
    console.log(process.env.IMAGE_SERVICE_BASE_URL + '/images')
    console.log('access token:' + process.env.IMAGE_SERVICE_ACCESS_TOKEN)

    // Forward the actual image data to the image service.
    const response = await fetch (process.env.IMAGE_SERVICE_BASE_URL + '/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Private-Token': `${process.env.IMAGE_SERVICE_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(image),
    })

    // Retrieve the imageUrl from the response. 
    const data = await response.json()

    if (!response.ok) {
      // Testing, remove later.
      console.log('Error:', response.status, response.statusText)
    } 

    const imageUrl = data.imageUrl

    // Store the info about the image in the resource service.
    const imageData = {
      imageUrl: imageUrl,
      description: req.body.description,
      location: req.body.location,
    }
 
    try {
      // Store the image data in the resource service.
      const data = await ImageModel.create(imageData)
      res.status(201).json(data)
    } catch (error) {
      console.log('Error:', error)
      // Error handling.
    }
  }

  updateImage (req, res, next) {
  }

  deleteImage (req, res, next) {
  }

  partEditImage (req, res, next) {
  }
}