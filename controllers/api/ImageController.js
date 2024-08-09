import { ImageModel } from '../../models/imageModel.js'

export class ImageController {
  /**
   * Method to get all images from the resource service.
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
        images: images,
        currentPage: currentPage,
        numberOfPages: numberOfPages,
        // The next url is added in the response to make it easier to navigate to the next page from the client side.
        nextUrl: `${req.protocol}/images?page=${currentPage + 1}`,
      })
    } catch (error) {
      console.log('Error:', error)
    }

    // Retrieve the images from the resource service.
  }

  async getImage (req, res, next) {
    // The image id is sent in the request parameters.
    const id = req.params.id // It has to match what was defined in the image router.
    console.log(id)

    // Fetch the image from the database with get.
    try {
      const image = await ImageModel.findById(id)
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

    // Create an image object to send to the image service.
    const image = {
      data: req.body.data,
      contentType: req.body.contentType,
      description: req.body.description,
      location: req.body.location,
    }

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
      imageUrl: imageUrl,
      description: req.body.description,
      location: req.body.location,
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

  async updateImage (req, res, next) {
    // The image id is sent in the request parameters.
    const id = req.params.id 

    // All the info needs to be passed and updated.
    try {
      const image = await ImageModel.findOneAndUpdate(id, req.body, { new: true })

      res.status(200).json(image)
    } catch (error) {
      console.log('Error:', error)
    }
  }

  deleteImage (req, res, next) {
  }

  partEditImage (req, res, next) {
    // Part of the info can be updated.
  }
}