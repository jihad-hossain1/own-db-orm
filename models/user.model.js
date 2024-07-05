const { Schema,db } = require("../orm");

let user = new Schema({
    name: String,
    email: String,
    password: String,
});


user.user =  db.model("users", user);


module.exports = user;