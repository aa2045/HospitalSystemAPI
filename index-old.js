//inshallah, jira test 4

// Import required frameworks
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const {MongoClient}  = require('mongodb');
var ObjectID = require('mongodb').ObjectID;


// MongoDB constants
const DB_URL = "mongodb+srv://Priyanka:PriyankaF21AO@clusterf21ao.0n6hd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
const client = new MongoClient(DB_URL, {useUnifiedTopology: true});
const DB_NAME = "patients";

// Setup parser for POST requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());


// Set application listening port
const port = 8081;
app.listen(port, () => {

    console.log(`Task API app is listening at http://localhost:${port}`);

});

// No route - shows welcome message
app.get('/', (req, res) => {

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "Welcome to the Patient Management System!";
    responseObject['error'] = "None";
    res.send(responseObject);

});


// MODULE 1
// DEV REQUIREMENT 1
// Login route (POST) - create or return session details
app.post('/users/login', (req, res) => 
{
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

             
	         /*const userDocument = await colUsers.findOne({ $and: [{username:{ $eq: req.body.username }}, {password:{$eq: req.body.password}}] }, function(err, result) 
                 {
                     if (err) { // handle err  }
            
                    if (result) 
                    {} 
                    else 
                    {}
                    
                 });*/

            // Find one document by username and password
            const userDocument = await colUsers.findOne({ $and: [{username:{ $eq: req.body.username }}, {password:{$eq: req.body.password}}] });
            if(!userDocument)
            {
                // wrong credentials
                responseObject['message'] = "Login failed. See error for details.";
                responseObject['error'] = "Invalid username/password.";
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
	         console.log(err.stack);
	    }
	    finally {
	        //await client.close();
            
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
    

});

// MODULE 2
// DEV REQUIREMENT 2
// Registration route (POST) - create patient details
app.post('/patients/register', (req, res) => 
{
    console.log("Post made - REGISTER");
    // Fetch query parameter
    var userid = req.body.userid; 
    var sessiontoken = req.body.sessiontoken;
    var patientfirstname = req.body.firstname;
    var patientlastname = req.body.lastname;
    var patientemail = req.body.email;
    var patientbirthdate = req.body.birthdate;
    var patientgender = req.body.gender;
    var patientdiseases = req.body.diseases;
    var patientallergies = req.body.allergies;
    var patientward = req.body.wardnumber;

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
	
	         // Use the collection "patients", "users", "sessions"
	         const colPatients = db.collection("patients");
             const colUsers = db.collection("users");
             const colSessions = db.collection("sessions");

            // Find one document by userid and sessiontoken
            const sessionDocument = await colSessions.findOne({ $and: [{userid:{ $eq: new ObjectID(req.body.userid) }}, {sessiontoken:{$eq: req.body.sessiontoken}}] });
            if(!sessionDocument)
            {
                // wrong session details
                responseObject['message'] = "Request denied. See error for details.";
                responseObject['error'] = "Invalid session.";
            }
            else if(new Date(Date.now()) > sessionDocument.expiry)
            {
                // session timed out
                responseObject['message'] = "Request denied. See error for details.";
                responseObject['error'] = "Session expired. Please log in again.";
            }
            else
            {
                // session found 
                // Check access level by userid
                const accessDocument = await colUsers.findOne({_id:{ $eq: new ObjectID(req.body.userid) }});
                if(!accessDocument)
                {
                    // wrong user details
                    responseObject['message'] = "Request denied. See error for details.";
                    responseObject['error'] = "Cannot find user.";
                }
                else
                {
                    if(accessDocument.accesslevel != "Clerk")
                    {
                        // wrong access level
                        responseObject['message'] = "Request denied. See error for details.";
                        responseObject['error'] = "Access forbidden. Only users with 'Clerk' access level can make this change.";
                    }
                    else
                    {
                        // access allowed 
                        // Check for duplicate record
                        const existingDocument = await colPatients.findOne({email:{ $eq: req.body.email }});
                        if(existingDocument)
                        {
                            // email already in system
                            responseObject['message'] = "Request denied. See error for details.";
                            responseObject['error'] = "A record with this email address already exists.";

                            // create patient object and push to response object
                            var patientObject = {};
                            patientObject['recordnumber'] = existingDocument._id;
                            patientObject['email'] = existingDocument.email;
                            patientObject['name'] = existingDocument.name;
                            patientObject['gender'] = existingDocument.gender;
                            patientObject['birthdate'] = existingDocument.birthdate;
                            patientObject['diseases'] = existingDocument.diseases;
                            patientObject['allergies'] = existingDocument.allergies;
                            responseObject['patient'] = patientObject;
                        }
                        else
                        {
                            // create patient document
                            let patientDocument = 
                            {
                                "name": { "first": req.body.firstname, "last": req.body.lastname },
                                "email": req.body.email,      
                                "birthdate": new Date(req.body.birthdate),
                                "gender": req.body.gender,
                                "diseases": req.body.diseases,
                                "allergies": req.body.allergies,
                                "registeredby": req.body.userid,
                                "registeredon": new Date(Date.now()),
                                "wardnumber": new ObjectID(req.body.wardnumber)                                                                                                                            
                            };

                            // Insert a single document, wait for promise so we can read it back
                            const insertPatient = await colPatients.insertOne(patientDocument);
                            // Find inserted document
                            const findPatient = await colPatients.findOne({ email: { $eq: patientDocument.email } });
                            // Print to the console
                            console.log(findPatient);

                            if(!findPatient)
                            {
                                // Session could not be created 
                                responseObject['message'] = "Registration failed. See error for details.";
                                responseObject['error'] = "Unable to create patient record.";
                            }
                            else
                            {
                               // All good, patient record ready
                               responseObject['message'] = "Registration successful.";
                               responseObject['error'] = "None.";
                    
                               // create patient object and push to response object
                                var patientObject = {};
                                patientObject['recordnumber'] = findPatient._id;
                                patientObject['email'] = findPatient.email;
                                patientObject['name'] = findPatient.name;
                                patientObject['gender'] = findPatient.gender;
                                patientObject['birthdate'] = findPatient.birthdate;
                                patientObject['diseases'] = findPatient.diseases;
                                patientObject['allergies'] = findPatient.allergies;
                                responseObject['patient'] = patientObject;
                        
                           } 

                        }

                        
                    }
                  
                }
            }

	    }
        catch (err) {
	         console.log(err.stack);
	    }
	    finally {
	        //await client.close();
            
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
    

});

// MODULE 1
// DEV REQUIREMENT 3    
// Patient details route (GET) - retrieve patient details
app.get('/patients/:recordnumber', (req, res) => {
    
    console.log("Get made - PATIENT");
    // Fetch query parameter
    var userid = req.query.userid; 
    var sessiontoken = req.query.sessiontoken;
    var recordnumber = req.params.recordnumber; 
    console.log(req.query);

    // create response object with initial values
    var responseObject = {};
    responseObject['message'] = "None";
    responseObject['error'] = "None";

    async function run() {
	    try {
	        
            await client.connect();
	         console.log("Connected correctly to server");
	         const db = client.db(DB_NAME);
	
	         // Use the collection "patients", "sessions"
	         const colPatients = db.collection("patients");
             const colSessions = db.collection("sessions");

            // Find one document by userid and sessiontoken
            const sessionDocument = await colSessions.findOne({ $and: [{userid:{ $eq: new ObjectID(req.query.userid) }}, {sessiontoken:{$eq: req.query.sessiontoken}}] });
            if(!sessionDocument)
            {
                // wrong session details
                responseObject['message'] = "Request denied. See error for details.";
                responseObject['error'] = "Invalid session.";
            }
            else if(new Date(Date.now()) > sessionDocument.expiry)
            {
                // session timed out
                responseObject['message'] = "Request denied. See error for details.";
                responseObject['error'] = "Session expired. Please log in again.";
            }
            else
            {
                // session found 
                // access allowed 
                // Find document by recordnumber
                const patientDocument = await colPatients.findOne({_id:{ $eq: new ObjectID(req.params.recordnumber) }});
                if(!patientDocument)
                {
                    // record not found
                    responseObject['message'] = "Request failed. See error for details.";
                    responseObject['error'] = "A record with this number does not exist in the system.";
                }
                else
                {
                    // record found
                    responseObject['message'] = "Request successful.";
                    responseObject['error'] = "None.";

                    // create patient object and push to response object
                    var patientObject = {};
                    patientObject['recordnumber'] = patientDocument._id;
                    patientObject['email'] = patientDocument.email;
                    patientObject['name'] = patientDocument.name;
                    patientObject['gender'] = patientDocument.gender;
                    patientObject['birthdate'] = patientDocument.birthdate;
                    patientObject['diseases'] = patientDocument.diseases;
                    patientObject['allergies'] = patientDocument.allergies;
                    responseObject['patient'] = patientDocument;
                }    
                         
            }

	    }
        catch (err) {
	         console.log(err.stack);
	    }
	    finally {
	        //await client.close();
            
	    }

        // send response object
        res.send(responseObject);
	}
	
	run().catch(console.dir);
    

});



