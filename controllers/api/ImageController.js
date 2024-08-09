import { ImageModel } from '../../models/imageModel.js'

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

      // Use the following to check combine into new url to send in res.
      console.log(req.protocol, req.hostname, req.baseUrl)

      // Make sure that currentpage + 1 does not exceed the current number of pages.

      // Check that the response is OK + error handling.
      res.status(200).json({
        images,
        currentPage,
        numberOfPages,
        // The next url is added in the response to make it easier to navigate to the next page from the client side.
        nextUrl: `${req.protocol}/images?page=${currentPage + 1}`
      })
    } catch (error) {
      console.log('Error:', error)
    }

    // Retrieve the images from the resource service.
  }

  /**
   * Method to get a specific image from the resource service.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   */
  async getImage (req, res, next) {
    // The image id is sent in the request parameters.
    const id = req.params.id // It has to match what was defined in the image router.
    console.log(id)

    // Sanitize the data in the req.body.

    // Fetch the image from the database with get.
    try {
      const image = await ImageModel.findById({ id })
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

    // Retrieve the imageUrl from the response.
    const data = await response.json()

    console.log(data)

    if (!response.ok) {
      // Testing, remove later.
      console.log('Error')
    }

    const imageUrl = data.imageUrl

    // Is undefined, how can I retrieve the userId?
    console.log(req.body.userId)

    // Store the info about the image in the resource service.
    const imageData = {
      imageUrl,
      description: req.body.description,
      location: req.body.location
      // userId: req.body.userId
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
        console.log(response.statusText)
      }

      // Update the image data in the resource service.
      const image = await ImageModel.findOneAndUpdate({ _id: id }, req.body, { new: true })

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
      }

      // Delete the image data from the resource service.
      ImageModel.findByIdAndDelete({ _id: id })
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
      }

      // Update the image data in the resource service.
      const image = ImageModel.findOneAndUpdate({ _id: id }, req.body, { new: true })

      res.status(200).json(image)
    } catch (error) {
      console.log('Error:', error)
    }
  }
}
