/**
 * @file Defines the user router.
 * @module routes/userRouter
 * @author Mats Loock
 * @version 3.2.0
 */

import express from 'express'
import { UserController } from '../../../controllers/api/UserController.js'

export const router = express.Router()

const controller = new UserController()

// Provide req.user to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadUserDocument(req, res, next, id))

// GET users/:id
// TODO: Add authorization!!!
router.get('/:id', (req, res, next) => controller.find(req, res, next))
