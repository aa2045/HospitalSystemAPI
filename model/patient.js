// Mongoose schema for patient document

const mongoose = require("mongoose");

const Patient = mongoose.model(
  "Patient",
  new mongoose.Schema({
    name: [{
      firstname : String,
      lastname : String
       }],
    email: String,
    gender: String,
    birthdate: { type: Date, default: Date.now() },
    diseases: [String],
    allergies: [String],
    registeredby: Schema.Types.ObjectId,
    registeredon: { type: Date, default: Date.now() },
    registeredfor: Schema.Types.ObjectId
  })
);

module.exports = Patient;