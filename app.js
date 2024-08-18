const express = require("express");
const User = require("./models/user.model");
const { Model, ValidationError, DatabaseError } = require("./orm");

const app = express();

// Middleware
app.use(express.json());

// Routes
app.post("/users", async(req, res) => {
  try {
    const newUser = await User.user.create(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    if (error instanceof ValidationError) {
      console.error("Validation Error:", error.message);
      return res.status(400).json({ error: error.message });
    } else if (error instanceof DatabaseError) {
      console.error("Database Error:", error.message);
      return res.status(400).json({ error: error.message });
    } else {
      console.error("Unexpected Error:", error.message);
      return res.status(400).json({ error: error.message });
    }
  }
});

app.get("/users", (req, res) => {
 try {
   const users = User.find("users");
   return res.json({ users:users });
 } catch (error) {
  return res.status(500).json({ error: error.message });
 }
});

app.get("/users/:id", (req, res) => {

  try {
    const user = User.findOne("users", parseInt(req.params.id));
    if (user) {
      res.json(user);
    } else {
      res.status(404).send("User not found");
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

app.put("/users/:id", (req, res) => {
  User.update("users", parseInt(req.params.id, 10), req.body);
  const updatedUser = User.findOne(
    "users",
    parseInt(req.params.id, 10)
  );
  res.json(updatedUser);
});

app.patch("/users/:id", (req, res) => {
  User.patch("users", parseInt(req.params.id, 10), req.body);
  const updatedUser = User.findOne(
    "users",
    parseInt(req.params.id, 10)
  );
  res.json(updatedUser);
});

app.delete("/users/:id", (req, res) => {
  try {
     const deletedUser = User.delete("users", +req.params.id);
  
    if (deletedUser) {
      return res.status(200).json({ message: "User deleted successfully" });
    } else {
      return res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = app;
