const { readData, writeData, filePath } = require("../utils/data-method");
const path = require("path");

// Custom error classes
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = "ValidationError";
  }
}

class DatabaseError extends Error {
  constructor(message) {
    super(message);
    this.name = "DatabaseError";
  }
}

// Schema class to define the schema structure
class Schema {
  constructor(schemaDefinition) {
    this.schemaDefinition = schemaDefinition;
  }

  validate(doc) {
    const validatedDoc = {};
    for (const key in this.schemaDefinition) {
      if (doc.hasOwnProperty(key)) {
        const definition = this.schemaDefinition[key];

        try {
          // Type and custom validation handling
          if (typeof definition === 'function') {
            if (definition.name in { String: 1, Number: 1, Boolean: 1 }) {
              if (typeof doc[key] !== definition.name.toLowerCase()) {
                throw new ValidationError(`Invalid type for field ${key}. Expected ${definition.name}, got ${typeof doc[key]}`);
              }
            } else {
              const error = definition(doc[key]);
              if (error) throw new ValidationError(`Validation failed for field ${key}: ${error}`);
            }
          } else if (typeof definition === 'object' && typeof definition.type === 'function') {
            if (typeof doc[key] !== definition.type.name.toLowerCase()) {
              throw new ValidationError(`Invalid type for field ${key}. Expected ${definition.type.name}, got ${typeof doc[key]}`);
            }

            if (definition.validate && typeof definition.validate === 'function') {
              const error = definition.validate(doc[key]);
              if (error) throw new ValidationError(`Validation failed for field ${key}: ${error}`);
            }
          }

          validatedDoc[key] = doc[key];
        } catch (error) {
          if (error instanceof ValidationError) {
            console.error(error.message);
            throw error;
          } else {
            throw new Error(`Unexpected error during validation: ${error.message}`);
          }
        }
      }
    }
    return validatedDoc;
  }
}

// Model class to handle data operations
class Model {
  constructor(modelName, schema) {
    this.modelName = modelName;
    this.schema = schema;
    this.filePath = path.join(__dirname, `../db/${modelName}.json`);
  }

  create(doc) {
    try {
      const data = readData(this.filePath);
      if (!Array.isArray(data)) {
        throw new DatabaseError("Data read from file is not an array");
      }
      const validatedDoc = this.schema.validate(doc);
      const newDoc = { _id: Math.floor(Math.random() * 1000), ...validatedDoc };
      data.push(newDoc);
      writeData(this.filePath, data);
      return newDoc;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        console.error(error.message);
        throw error;
      } else {
        throw new Error(`Unexpected error during create operation: ${error.message}`);
      }
    }
  }

  static find(modelName) {
    try {
      const filePath = path.join(__dirname, `../db/${modelName}.json`);
      return readData(filePath);
    } catch (error) {
      throw new DatabaseError(`Error reading data for model ${modelName}: ${error.message}`);
    }
  }

  static findOne(modelName, id) {
    try {
      const filePath = path.join(__dirname, `../db/${modelName}.json`);
      const data = readData(filePath);
      const doc = data.find((item) => item._id === id);
      if (!doc) throw new DatabaseError(`Document with id ${id} not found in model ${modelName}`);
      return doc;
    } catch (error) {
      throw new DatabaseError(`Error finding document with id ${id} in model ${modelName}: ${error.message}`);
    }
  }

  static delete(modelName, id) {
    try {
      const filePath = path.join(__dirname, `../db/${modelName}.json`);
      let data = readData(filePath);
      const initialLength = data.length;
      data = data.filter((item) => item._id !== id);
      if (data.length === initialLength) throw new DatabaseError(`Document with id ${id} not found in model ${modelName}`);
      writeData(filePath, data);
    } catch (error) {
      throw new DatabaseError(`Error deleting document with id ${id} in model ${modelName}: ${error.message}`);
    }
  }

  static update(modelName, id, newFields) {
    try {
      const filePath = path.join(__dirname, `../db/${modelName}.json`);
      const data = readData(filePath);
      const index = data.findIndex((item) => item._id === id);
      if (index === -1) throw new DatabaseError(`Document with id ${id} not found in model ${modelName}`);

      const validatedFields = {};
      for (const key in newFields) {
        if (this.schema.schemaDefinition.hasOwnProperty(key)) {
          validatedFields[key] = newFields[key];
        }
      }
      data[index] = { ...data[index], ...validatedFields };
      writeData(filePath, data);
    } catch (error) {
      if (error instanceof ValidationError || error instanceof DatabaseError) {
        console.error(error.message);
        throw error;
      } else {
        throw new Error(`Unexpected error during update operation: ${error.message}`);
      }
    }
  }

  static findUnique(modelName, field) {
    try {
      const filePath = path.join(__dirname, `../db/${modelName}.json`);
      const data = readData(filePath);
      const uniqueValues = new Set();
      data.forEach((item) => uniqueValues.add(item[field]));
      return Array.from(uniqueValues);
    } catch (error) {
      throw new DatabaseError(`Error finding unique values for field ${field} in model ${modelName}: ${error.message}`);
    }
  }
}

// DB class to manage models
class DB {
  constructor() {
    this.models = {};
  }

  model(modelName, schema) {
    if (!this.models[modelName]) {
      const model = new Model(modelName, schema);
      // Attach static methods to the model instance
      Object.assign(model, Model);
      this.models[modelName] = model;
    }
    return this.models[modelName];
  }
}

// Singleton instance of DB
const db = new DB();

module.exports = { Schema, db, Model, ValidationError, DatabaseError };
