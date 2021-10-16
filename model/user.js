// Mongoose schema for user document

const mongoose = require("mongoose");

const User = mongoose.model(
  "User",
  new mongoose.Schema({
    name: [{
      firstname : String,
      lastname : String
       }],
    username: String,
    password: String,
    accessLevel: {
      type: String,
      enum: ['Clerk', 'Doctor', 'Nurse', 'Paramedic']
    }
  })
);

module.exports = User;