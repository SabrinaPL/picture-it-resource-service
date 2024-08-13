/**
 * @file API version 1 router.
 * @module routes/router
 * @author Mats Loock & Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 3.0.0
 */

import express from 'express'
import { router as imageRouter } from './imageRouter.js'

export const router = express.Router()

router.get('/', (req, res) => res.json({ message: 'Welcome to version 1 of the Resource API\n\nTo get data of stored images, use the "/images" and "images/{id}" endpoints with a GET-request\nTo create a new image make a POST-request to the "/images" endpoint.\nTo edit or partially edit an image make a PUT or PATCH-request to the "images/{id}" endpoint and to delete an image make a DELETE-request to the same endpoint.' }))
router.use('/images', imageRouter)
