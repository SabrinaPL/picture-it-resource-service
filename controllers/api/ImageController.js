import { ImageModel } from '../../models/imageModel.js'

export class ImageController {
  async getImages (req, res, next) {
 
  }

  async getImage (req, res, next) {
 
  }

  async createImage (req, res, next) {
    // Create a new image containing the data from the request body (base64-encoded image data, title, description, user-id).

    const image = {
      data: req.body.data,
      contentType: req.body.contentType,
    }

    // Forward the actual image data to the image service.
    const response = await fetch (process.env.IMAGE_SERVICE_BASE_URL + '/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': process.env.IMAGE_SERVICE_ACCESS_TOKEN,
      },
      body: JSON.stringify(image),
    })

    if (!response.ok) {
      // Testing, remove later.
      console.log('Error:', response.status, response.statusText)
    } 

    // Retrieve the imageUrl from the response. 
    const data = await response.json()

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