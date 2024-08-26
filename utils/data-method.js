const fs = require("fs");
const path = require("path");

const readData = (filePath) => {
  console.log(filePath);
  if (!fs.existsSync(filePath)) return [];
  const data = fs.readFileSync(filePath, "utf8");
  return data ? JSON.parse(data) : [];
};

const writeData = (filePath, data) => {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

function filePath(modelName) {
  return path.join(__dirname, `../db/${modelName}.json`);
}

console.log("anything changed")

module.exports = { readData, writeData , filePath};