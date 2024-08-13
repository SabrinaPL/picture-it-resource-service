/**
 * @file Defines the main router.
 * @module routes/router
 * @author Mats Loock & Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 3.0.0
 */

import express from 'express'
import http from 'node:http'
import { router as v1Router } from './api/v1/router.js'

export const router = express.Router()

// In dev use '/api/v1' as base path, in production use '/'.
router.use('/', v1Router)

// Catch 404 (ALWAYS keep this as the last route).
router.use('*', (req, res, next) => {
  const statusCode = 404
  const error = new Error(http.STATUS_CODES[statusCode])
  error.status = statusCode

  next(error)
})
