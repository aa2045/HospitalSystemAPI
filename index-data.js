
     const {MongoClient}  = require('mongodb');
	 
	// Replace the following with your Atlas connection string                                                                                                                                        
	const url = "mongodb+srv://Priyanka:PriyankaF21AO@clusterf21ao.0n6hd.mongodb.net/myFirstDatabase?retryWrites=true&w=majority";
	const client = new MongoClient(url);
	 
	 // The database to use
	 const dbName = "patients";
	                      
	 async function run() {
	    try {
	         await client.connect();
	         console.log("Connected correctly to server");
	         const db = client.db(dbName);
	
	         // Use the collection "users"
	         const col = db.collection("users");
	        
             let userDocument = {
                "name": { "first": "Eli", "last": "Marshall" },
                "username": "EliMarshall",                                                                                                                               
                "accesslevel": "Nurse",                                                                                                                                   
                "password": "Eli@1"
            }
	
	         // Insert a single document, wait for promise so we can read it back
	         const p = await col.insertOne(userDocument);
	         // Find one document
	         const myDoc = await col.findOne({ username: { $eq: 'EliMarshall' } });
	         // Print to the console
	         console.log(myDoc);
	
	        } catch (err) {
	         console.log(err.stack);
	     }
	 
	     finally {
	        await client.close();
	    }
	}
	
	run().catch(console.dir);