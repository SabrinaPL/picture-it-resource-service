/**
 * @file Defines the image router.
 * @module imageRouter
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 */

import { authenticateJWT } from "../../../middlewares/auth";

// Protect the routes using the authenticateJWT middleware.
router.use('*', authenticateJWT)

// connect get, post, put, patch, delete methods to the controller methods.