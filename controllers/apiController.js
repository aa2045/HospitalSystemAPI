// Import required frameworks
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

// MongoDB constants
const DB_URL = "mongodb+srv://Priyanka:PriyankaF21AO@clusterf21ao.0n6hd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";


class apiController {

  static async index(req, res) {
    try {

      // create response object with welcome text
      //var responseObject = {};
      apiController.responseObject['message'] = "Welcome to the Patient Management System!";
      apiController.responseObject['error'] = "None";
      res.send(apiController.responseObject);
    } catch (exception) {
      res.status(500);
      res.send(exception);
    }
  }

  
}

module.exports = apiController;
