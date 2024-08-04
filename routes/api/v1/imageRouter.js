/**
 * @file Defines the image router.
 * @module imageRouter
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 */

import express from 'express'
import { authenticateJWT } from '../../../middlewares/auth.js'
import { ImageController } from '../../../controllers/api/ImageController.js'

export const router = express.Router()

const imageController = new ImageController()

// Protect the routes using the authenticateJWT middleware.
router.use('*', authenticateJWT)

// Connect get, post, put, patch & delete requests to the controller methods.
router.get('/', imageController.getImages)
router.post('/', imageController.createImage)
router.get('/:id', imageController.getImage)
router.put('/:id', imageController.updateImage)
router.patch('/:id', imageController.partEditImage)
router.delete('/:id', imageController.deleteImage)

