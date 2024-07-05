const { readData, writeData, filePath } = require("../utils/data-method");
const path = require("path");

// Schema class to define the schema structure
class Schema {
  constructor(schemaDefinition) {
    this.schemaDefinition = schemaDefinition;
  }

  validate(doc) {
    const schema = new this.schemaDefinition();
    return schema.validate(doc);
  }

  findOne(modelName, id) {
    const data = readData(filePath(modelName));
    return data.find((item) => item._id === id);
  }

  find(modelName) {
    return readData(filePath(modelName));
  }

  delete(modelName, id) {
    const data = readData(filePath(modelName));
    const index = data.findIndex((item) => item._id === id);
    if (index !== -1) {
      data.splice(index, 1);
      writeData(filePath(modelName), data);
    }
  }

  patch(modelName, id, newFields) {
    const data = readData(filePath(modelName));
    const index = data.findIndex((item) => item._id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...newFields };
      writeData(filePath(modelName), data);
    }
  }

  findUnique(modelName, field) {
    const data = readData(filePath(modelName));
    const uniqueValues = new Set();
    data.forEach((item) => uniqueValues.add(item[field]));
    return Array.from(uniqueValues);
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
    const data = readData(this.filePath);
    if (!Array.isArray(data)) {
      throw new Error("Data read from file is not an array");
    }
    const newDoc = { _id: Math.floor(Math.random() * 1000), ...doc };
    data.push(newDoc);
    writeData(this.filePath, data);
    return newDoc;
  }

  static find(modelName) {
    const filePath = path.join(__dirname, `../db/${modelName}.json`);
    console.log("🚀 ~ Model ~ find ~ filePath:", filePath);
    return readData(filePath);
  }

  static findOne(modelName, id) {
    const filePath = path.join(__dirname, `../db/${modelName}.json`);
    const data = readData(filePath);
    return data.find((item) => item._id === id);
  }

  static delete(modelName, id) {
    const filePath = path.join(__dirname, `../db/${modelName}.json`);
    let data = readData(filePath);
    data = data.filter((item) => item._id !== id);
    writeData(filePath, data);
  }

  static update(modelName, id, newFields) {
    const filePath = path.join(__dirname, `../db/${modelName}.json`);
    const data = readData(filePath);
    const index = data.findIndex((item) => item._id === id);
    if (index !== -1) {
      data[index] = { ...data[index], ...newFields };
      writeData(filePath, data);
    }
  }

  static findUnique(modelName, field) {
    const filePath = path.join(__dirname, `../db/${modelName}.json`);
    const data = readData(filePath);
    const uniqueValues = new Set();
    data.forEach((item) => uniqueValues.add(item[field]));
    return Array.from(uniqueValues);
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

module.exports = { Schema, db, Model };
