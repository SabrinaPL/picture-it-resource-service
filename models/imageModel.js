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
  
})

schema.add(BASE_SCHEMA)

// Create a model using the schema.
export const ImageModel = mongoose.model('Image', schema)
