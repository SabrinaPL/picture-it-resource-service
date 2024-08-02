/**
 * @file Defines the TaskController class.
 * @module controllers/TaskController
 * @author Mats Loock
 * @version 3.1.0
 */

import { logger } from '../../config/winston.js'
import { TaskModel } from '../../models/TaskModel.js'

/**
 * Encapsulates a controller.
 */
export class TasksController {
  /**
   * Provide req.doc to the route if :id is present.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   * @param {string} id - The value of the id for the task to load.
   */
  async loadTaskDocument (req, res, next, id) {
    try {
      logger.silly('Loading task document', { id })

      const taskDocument = await TaskModel.findById(id)

      if (!taskDocument) {
        const error = new Error('The task you requested does not exist.')
        error.status = 404
        throw error
      }

      req.doc = taskDocument

      logger.silly('Loaded task document', { id })

      next()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing a task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async find (req, res, next) {
    try {
      res.json(req.doc)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Sends a JSON response containing all tasks.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async findAll (req, res, next) {
    try {
      logger.silly('Loading all task documents')

      const tasks = await TaskModel.find()

      logger.silly('Loaded all task documents')

      res.json(tasks)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Creates a new task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async create (req, res, next) {
    try {
      logger.silly('Creating new task document', { body: req.body })

      const { description, done } = req.body

      const taskDocument = await TaskModel.create({
        description,
        done: done === 'on'
      })

      logger.silly('Created new task document')

      const location = new URL(
        `${req.protocol}://${req.get('host')}${req.baseUrl}/${taskDocument.id}`
      )

      res
        .location(location.href)
        .status(201)
        .json(taskDocument)
    } catch (error) {
      next(error)
    }
  }

  /**
   * Updates a specific task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async update (req, res, next) {
    try {
      logger.silly('Updating task document', { id: req.doc.id, body: req.body })

      if ('description' in req.body) req.doc.description = req.body.description
      if ('done' in req.body) req.doc.done = req.body.done === 'on'

      if (req.doc.isModified()) {
        await req.doc.save()
        logger.silly('Updated task document', { id: req.doc.id })
      } else {
        logger.silly('Unnecessary to update task document', { id: req.doc.id })
      }

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }

  /**
   * Deletes the specified task.
   *
   * @param {object} req - Express request object.
   * @param {object} res - Express response object.
   * @param {Function} next - Express next middleware function.
   */
  async delete (req, res, next) {
    try {
      logger.silly('Deleting task document', { id: req.doc.id })

      await req.doc.deleteOne()

      logger.silly('Deleted task document', { id: req.doc.id })

      res
        .status(204)
        .end()
    } catch (error) {
      next(error)
    }
  }
}
