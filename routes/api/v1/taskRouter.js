/**
 * @file Defines the task router.
 * @module routes/taskRouter
 * @author Mats Loock
 * @version 3.1.0
 */

import express from 'express'
import { TasksController } from '../../../controllers/api/TaskController.js'
import { authenticateJWT, hasPermission, PermissionLevels } from '../../../middlewares/auth.js'

export const router = express.Router()

const controller = new TasksController()

// Map HTTP verbs and route paths to controller actions.

// Provide req.task to the route if :id is present in the route path.
router.param('id', (req, res, next, id) => controller.loadTask(req, res, next, id))

// GET tasks
router.get('/',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.findAll(req, res, next)
)

// GET tasks/:id
router.get('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.READ),
  (req, res, next) => controller.find(req, res, next)
)

// POST tasks
router.post('/',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.CREATE),
  (req, res, next) => controller.create(req, res, next)
)

// PUT tasks/:id
router.put('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.UPDATE),
  (req, res, next) => controller.update(req, res, next)
)

// DELETE tasks/:id
router.delete('/:id',
  authenticateJWT,
  (req, res, next) => hasPermission(req, res, next, PermissionLevels.DELETE),
  (req, res, next) => controller.delete(req, res, next)
)
