import http from 'node:http'
import sanitizeHtml from 'sanitize-html'
import { ImageModel } from '../../models/imageModel.js'
import { JsonWebToken } from '../../lib/JsonWebToken.js'
import { CUSTOM_STATUS_CODES } from '../../utils/customErrors.js'

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
   * @returns {*} - Status code and message.
   */
  async getImages (req, res, next) {
    try {
    // Implement pagination (as recommended by Mats and Johan).
      const itemsPerPage = 10
      const currentPage = req.query.page ? parseInt(req.query.page) : 1
      const skipToNextPage = (currentPage - 1) * itemsPerPage

      // Calculate the number of pages needed to display all the images.
      const numberOfImages = await ImageModel.countDocuments()
      const numberOfPages = Math.ceil(numberOfImages / itemsPerPage)

      // Fetch the items (chaining skip and limit, as suggested by copilot).
      const images = await ImageModel
        .find()
        .skip(skipToNextPage)
        .limit(itemsPerPage)

      // Use the following to combine into new url to send in res.
      console.log(req.protocol, req.hostname, req.baseUrl)

      if (!images) {
        return res
          .status(500)
          .json({ status_code: 500, message: CUSTOM_STATUS_CODES[500] })
      }

      res
        .status(200)
        .json({
          images,
          currentPage,
          numberOfPages,
          // The next url is added in the response to make it easier to   navigate to the next page from the client side.
          // Logic to check if the next page is the last page and adjust the  url accordingly (as suggested by copilot).
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
    try {
      const id = req.params.id

      const image = await ImageModel.findOne({ id })

      if (!image) {
        console.log('No image found in local database')
      }

      res
        .status(200)
        .json(image)
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
   * @returns {*} - Status code and message.
   */
  async createImage (req, res, next) {
    try {
      // Sanitize the data.
      req.body.contentType = sanitizeHtml(req.body.contentType)
      req.body.location = sanitizeHtml(req.body.location)
      req.body.description = sanitizeHtml(req.body.description)
      req.body.data = sanitizeHtml(req.body.data)

      // Format base64 image data:
      // I want to remove the 'data:image/{contentType};base64' from the string.

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
        if (response.status === 400) {
          throw new Error('Bad Request')
        } else if (response.status === 401) {
          throw new Error('Unauthorized')
        }
      }

      // Retrieve the imageUrl and imageId from the response.
      const data = await response.json()
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

      // Store the image data in the resource service.
      const dataResource = await ImageModel.create(imageData)

      if (!dataResource) {
        // Error handling.
      }

      res
        .status(201)
        .json(data)
    } catch (error) {
      // Default to 500 if no status code is provided.
      let httpStatusCode = 500

      if (error.message === 'Bad Request') {
        httpStatusCode = 400
      } else if (error.message === 'Unauthorized') {
        httpStatusCode = 401
      }

      const err = new Error(CUSTOM_STATUS_CODES[httpStatusCode] || http.STATUS_CODES[httpStatusCode])
      err.status = httpStatusCode
      err.cause = error

      next(err)
    }
  }

  /**
   * Method to update an image in the resource service.
   *
   * @param {*} req - The request object.
   * @param {*} res - The response object.
   * @param {*} next - The next middleware function.
   * @returns {*} - Status code and message.
   */
  async updateImage (req, res, next) {
    try {
      const id = req.params.id

      if (!req.body.description || !req.body.data || !req.body.location || !req.body.contentType) {
        return res
          .status(400)
          .json({ status_code: 400, message: CUSTOM_STATUS_CODES[400] })
      }

      // Sanitize the data in the req.body.
      req.body.description = sanitizeHtml(req.body.description)
      req.body.data = sanitizeHtml(req.body.data)
      req.body.location = sanitizeHtml(req.body.location)
      req.body.contentType = sanitizeHtml(req.body.contentType)

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
      }

      // Update the image data in the resource service.
      const image = await ImageModel.findOneAndUpdate({ id }, req.body, { new: true })

      res
        .status(200)
        .json(image)
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
    try {
      const id = req.params.id

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
      await ImageModel.findOneAndDelete({ id })

      res
        .status(204)
        .end()
    } catch (error) {
      // Error handling.
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
    try {
      const id = req.params.id

      // Sanitize the data in the req.body.
      if (req.body.description) {
        req.body.description = sanitizeHtml(req.body.description)
      } 
      if (req.body.data) {
        req.body.data = sanitizeHtml(req.body.data)
      } 
      if (req.body.location) {
        req.body.location = sanitizeHtml(req.body. location)
      } 
      if (req.body.contentType) {
        req.body.contentType = sanitizeHtml(req.body.contentType)
      }

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
      const image = await ImageModel.findOneAndUpdate({ id }, req.body, { new: true })

      if (!image) {
        // Error handling.
      }

      res
        .status(200)
        .json(image)
    } catch (error) {
      // Error handling.
    }
  }
}
