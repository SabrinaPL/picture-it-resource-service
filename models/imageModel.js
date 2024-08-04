/**
 * @file Defines the image model.
 * @module models/ImageModel
 * @author Sabrina Prichard-Lybeck <sp223kz@student.lnu.se>
 * @version 1.0.0
 */

import mongoose from 'mongoose'
import { BASE_SCHEMA } from './baseSchema.js'
import { timeStamp } from 'console'

// Create a schema.
const schema = new mongoose.Schema({
  imageUrl: {
    type: String, 
    // verify formatting?
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  description: {
    type: String, 
    required: true,
  },
  id: {
    type: String,
    required: true,
  },
},
{
  timestamps: true
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const ImageModel = mongoose.model('Image', schema)
