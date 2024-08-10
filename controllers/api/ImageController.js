import { ImageModel } from '../../models/imageModel.js'
import { JsonWebToken } from '../../lib/JsonWebToken.js'

/**
 * Controller for the image resource.
 *
 * @module controllers/api/ImageController
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 1.0.0
 */
export class ImageController {
  /**
   * Method to get all images from the resource service.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async getImages (req, res, next) {
    // Implement pagination (as recommended by Mats and Johan).
    const itemsPerPage = 10
    const currentPage = req.query.page ? parseInt(req.query.page) : 1
    const skipToNextPage = (currentPage - 1) * itemsPerPage

    // Calculate the number of pages needed to display all the images.
    const numberOfImages = await ImageModel.countDocuments()
    const numberOfPages = Math.ceil(numberOfImages / itemsPerPage)

    try {
    // Fetch the items (chaining skip and limit, as suggested by copilot).
      const images = await ImageModel.find().skip(skipToNextPage).limit(itemsPerPage)

      // Use the following to combine into new url to send in res.
      console.log(req.protocol, req.hostname, req.baseUrl)

      // Check that the response is OK + error handling.
      if (!images) {
        res.status(404).json({ message: 'No images found' })
      }

      res.status(200).json({
        images,
        currentPage,
        numberOfPages,
        // The next url is added in the response to make it easier to navigate to the next page from the client side.
        // Logic to check if the next page is the last page and adjust the url accordingly (as suggested by copilot).
        nextUrl: `${req.protocol}/images?page=${currentPage + 1 > numberOfPages ? null : currentPage + 1}`
      })
    } catch (error) {
      console.log('Error:', error)
    }
  }

  /**
   * Method to get a specific image.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async getImage (req, res, next) {
    // The image id is sent in the request parameters.
    const id = req.params.id
    console.log(id)

    // Sanitize the data in the req.body.

    try {
      const image = await ImageModel.findOne({ id })

      if (!image) {
        console.log('No image found in local database')
      }

      res.status(200).json(image)
    } catch (error) {
      console.log('Error:', error)
    }
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

    // Sanitize the data in the req.body.

    // Create an image object to send to the image service.
    const image = {
      data: req.body.data,
      contentType: req.body.contentType,
      description: req.body.description,
      location: req.body.location
    }

    // Forward the actual image data to the image service.
    const response = await fetch(process.env.IMAGE_SERVICE_BASE_URL + '/images', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Private-Token': `${process.env.IMAGE_SERVICE_ACCESS_TOKEN}`
      },
      body: JSON.stringify(image)
    })

    if (!response.ok) {
      // Testing, remove later.
      console.log('Error')
      console.log(response.status)
    }

    // Retrieve the imageUrl from the response.
    const data = await response.json()

    console.log('Checking data in response:')
    console.log(data)
    console.log(data.id)

    const imageUrl = data.imageUrl
    const imageId = data.id

    // Fetch userId from the JWT.
    const user = await JsonWebToken.decodeUser(req.headers.authorization.split(' ')[1], process.env.JWT_PUBLIC_KEY)
    const userId = user.id

    // Store the info about the image in the resource service.
    const imageData = {
      imageUrl,
      description: req.body.description,
      location: req.body.location,
      id: imageId,
      userId
    }

    console.log(imageData)

    try {
      // Store the image data in the resource service.
      const data = await ImageModel.create(imageData)

      console.log(data)

      res.status(201).json(data)
    } catch (error) {
      console.log('Error:', error)
      // Error handling.
    }
  }

  /**
   * Method to update an image in the resource service.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async updateImage (req, res, next) {
    const id = req.params.id

    // Sanitize the data in the req.body.

    // All the info needs to be passed and updated.

    console.log(process.env.IMAGE_SERVICE_BASE_URL + '/images/' + id)

    try {
      // Send a request to the image service to update the image.
      const response = await fetch(process.env.IMAGE_SERVICE_BASE_URL + '/images/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': `${process.env.IMAGE_SERVICE_ACCESS_TOKEN}`
        },
        body: JSON.stringify(req.body)
      })

      if (!response.ok) {
        // Error handling.
        console.log('Error')
        console.log(response.status)
        console.log(await response.json())
      }

      // Update the image data in the resource service.
      const image = await ImageModel.findOneAndUpdate({ id }, req.body, { new: true })

      res.status(200).json(image)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  /**
   * Method to delete an image from the resource service.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async deleteImage (req, res, next) {
    const id = req.params.id

    // Sanitize the id.

    try {
      // Request to the image service to delete the image.
      const response = await fetch(process.env.IMAGE_SERVICE_BASE_URL + '/images/' + id, {
        method: 'DELETE',
        headers: {
          'X-API-Private-Token': `${process.env.IMAGE_SERVICE_ACCESS_TOKEN}`
        }
      })

      if (!response.ok) {
        // Error handling.
        console.log('Error')
        console.log(response.status)
      }

      // Delete the image data from the resource service.
      ImageModel.findOneAndDelete({ id })
      res.status(204).end()
    } catch (error) {
      console.log('Error:', error)
    }
  }

  /**
   * Method to partially edit an image.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async partEditImage (req, res, next) {
    // Part of the info can be updated.
    const id = req.params.id

    // Sanitize the data in the req.body.

    try {
      // Send a request to the image service to update the image.
      const response = await fetch(process.env.IMAGE_SERVICE_BASE_URL + '/images/' + id, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Private-Token': `${process.env.IMAGE_SERVICE_ACCESS_TOKEN}`
        },
        body: JSON.stringify(req.body)
      })

      if (!response.ok) {
        // Error handling.
        console.log('Error')
        console.log(response.status)
      }

      // Update the image data in the resource service.
      const image = ImageModel.findOneAndUpdate({ id }, req.body, { new: true })

      res.status(200).json(image)
    } catch (error) {
      console.log('Error:', error)
    }
  }
}
