/**
 * @file API version 1 router.
 * @module routes/router
 * @author Mats Loock & Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 3.0.0
 */

import express from 'express'
import { router as imageRouter } from './imageRouter.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Welcome to version 1 of the Resource API. Use the "/images" endpoint to get data of stored images with a GET-request or create new images with a POST-request. Use the "/images/{id}" endpoint to get data of a specific image with GET, edit an image with PUT or PATCH and delete an image with DELETE. When fetching images information about current page, amount of pages and nextUrl is also returned for pagination. To gain access to the Resource service register as a user and login via the "https://cscloud7-49.lnu.se/picture-it/api/v1/auth/" "/register" and "/login" endpoints.' }))

router.use('/images', imageRouter)
