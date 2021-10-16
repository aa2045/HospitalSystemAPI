// Import required frameworks
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;

// MongoDB constants
const DB_URL = "mongodb+srv://Priyanka:PriyankaF21AO@clusterf21ao.0n6hd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";


class usersController {

  static async userlogin(req, res) {
    console.log("Post made - LOGIN");
    // Fetch query parameter
    var username = req.body.username; 
    var password = req.body.password;
    console.log(req.body);

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error'] = "None";

    async function run() {
	    try {
	        
          await client.connect();

	         console.log("Connected correctly to server");
	         const db = client.db(DB_NAME);
	
	         // Use the collection "users", "sessions"
	         const colUsers = db.collection("users");
             const colSessions = db.collection("sessions");

            // Find one document by username and password
            const userDocument = await colUsers.findOne({ $and: [{username:{ $eq: req.body.username }}, {password:{$eq: req.body.password}}] });
            if(!userDocument)
            {
                // wrong credentials
                responseObject['message'] = "Login failed. See error for details.";
                responseObject['error'] = "Invalid username/password.";
                res.status(403);
            }
            else
            {
                // user found 
                // create session token and session document
                let token = Math.random().toString(36).substr(2, 10);
                let sessionDocument = 
                {
                    "userid": userDocument._id,                                                                                                                               
                    "sessiontoken": token,
                    "expiry": new Date(Date.now() + 60 * 120 * 1000) // session is valid for 2 hours only
                };

                // Insert a single document, wait for promise so we can read it back
                const insertSession = await colSessions.insertOne(sessionDocument);
                // Find inserted document
                const findSession = await colSessions.findOne({ userid: { $eq: sessionDocument.userid } });
                // Print to the console
                console.log(findSession);

                if(!findSession)
                {
                    // Session could not be created 
                    responseObject['message'] = "Login failed. See error for details.";
                    responseObject['error'] = "Unable to create session.";
                    res.status(500);
                }
                else
                {
                    // All good, session ready
                    responseObject['message'] = "Login successful.";
                    responseObject['error'] = "None.";
                    
                    // create user object and push to response object
                    var userObject = {};
                    userObject['userid'] = userDocument._id;
                    userObject['accessLevel'] = userDocument.accessLevel;
                    userObject['username'] = userDocument.username;
                    userObject['name'] = userDocument.name;
                    userObject['sessiontoken'] = token;
                    userObject['sessionid'] = findSession._id;
                    responseObject['user'] = userObject;
                        
                }

            }

	    }
        catch (err) {
           res.status(500);
	         console.log(err.stack);
	    }
	    finally {
	        //await client.close();
            
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
  }
}

module.exports = usersController;
