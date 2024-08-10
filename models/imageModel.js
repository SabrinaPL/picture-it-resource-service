/**
 * @file Defines the image model.
 * @module models/ImageModel
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'

// Create a schema.
const schema = new mongoose.Schema({
  imageUrl: {
    type: String,
    // verify formatting?
    required: true
  },
  location: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  // Added a unique identifier/custom id for the image so that the image data in resource db has the same identifier as the _id auto generated from the image service db (to easily connect the image to its data).
  id: {
    type: String,
    required: true,
    unique: true
  },
  userId: {
    type: String,
    required: true
  }
},
{
  timestamps: true
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const ImageModel = mongoose.model('Image', schema)
