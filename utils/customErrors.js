/**
 * @file Defines custom errors.
 * @module utils/customErrors
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 1.0.0
 */

export const CUSTOM_STATUS_CODES = {
  400: 'The request cannot or will not be processed due to something that is perceived to be a client error (for example,validation error).',
  401: 'Access token invalid or not provided.',
  403: 'The request contained valid data and was understood by the server, but the server is refusing action due to the authenticated user not having the necessary permissions for the resource.',
  404: 'The requested resource was not found.',
  500: 'An unexpected condition was encountered.'
}
