const { Schema, db } = require("../orm");

let userSchema = new Schema({
  name: {
    type: String,
    validate: (value) => {
      if (value.length < 3) {
        return "Username must be at least 3 characters long";
      }
      if (value.length > 15) {
        return "Username must be at most 15 characters long";
      }
      return null;
    }
  },
  email: {
    type: String,
    validate: (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value) ? null : "Invalid email format";
    }
  },
  password: {
    type: String,
    validate: (value) => {
      return value.length >= 6 ? null : "Password must be at least 6 characters long";
    }
  }
});

userSchema.user = db.model("users", userSchema);

module.exports = userSchema;


