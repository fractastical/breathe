
/**
 * This is server node.js app which communicates with MongoDB.
 * It runs on port 8085
 */


 var MongoClient = require('mongodb').MongoClient
        , assert = require('assert');

    // Connection URL
    var url = 'mongodb://localhost:27017/Swarm';


var express = require('express');
var bodyParser = require('body-parser');
var app = express();


app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Add headers

app.use(function (req, res, next) {

    // Website you wish to allow to connect

    var allowedOrigins = ['http://localhost:8082', 'http://localhost:8080'];
    var origin = req.headers.origin;
    if (allowedOrigins.indexOf(origin) > -1) {
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    // Request methods you wish to allow
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

    // Request headers you wish to allow
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

    // Set to true if you need the website to include cookies in the requests sent
    // to the API (e.g. in case you use sessions)
    res.setHeader('Access-Control-Allow-Credentials', true);

    // Pass to next layer of middleware
    next();
});


app.post('/process_get_one', function (req, res) {

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        
        // Get the documents collection
        var collection = db.collection('Membership');
        // Find some documents
        console.log("Requested following email address   ");
        console.log(req.body.email);

       

       // var id = require('mongodb').ObjectID(req.body.email);

       


        //var o_id = new ObjectId(req.body.id);
        collection.find({email: req.body.email }).toArray(function (err, docs) {    
            assert.equal(err, null);
            console.log("Found the following records");
            console.log(docs)
            
            res.end(JSON.stringify(docs)); 
        });
        console.log("Retrieved documents");
        db.close();
       
    });



})


app.post('/process_update_one', function (req, res) {

    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        // Get the documents collection
        var collection = db.collection('Membership');
        // Find some documents
        console.log("Requested update of following element");
        console.log(req.body.key);

       // var id = require('mongodb').ObjectID(req.body.id);

        var key = req.body.key;
        var keyValue = req.body.keyValue;
        var editorID = req.body.editor;
        var date = new Date();

        var email = req.body.email;
        var address = req.body.address;

        console.log("email:" + email);
        console.log("address:" + address);
        

        var query = {};
        query[key] = { data: keyValue, timeStamp: date, editor: editorID };
        console.log("query:" + query);
        collection.update({ email: email },
            {
                $set: { blockchainAddress: address  }
                ,
                

                               
            },

            function (err, result) {
                assert.equal(err, null);
                
                assert.equal(1, result.result.n);

                res.end(JSON.stringify(result));
            });

        console.log("Update one filed in document.");
        db.close();

    });



})



/**
 * 
 * Creates new membership.
 */

app.post('/add_new_member', function (req, res) {

    console.log("Member " + req.body.emailAddress);
    console.log("Email address " + req.body.firstName + " " + req.body.lastName);
   
    // Use connect method to connect to the Server
    MongoClient.connect(url, function (err, db) {
        assert.equal(null, err);
        console.log("Connected correctly to server");

        var date = new Date();


       // accounts.insert(newData, {safe: true}, callback);
        // Insert a single document
        db.collection('Membership').insertOne({ 
                             blockchainAddress:req.body.blockchainAddress,
							 firstName: req.body.firstName,
							 lastName:  req.body.lastName ,
                             email: req.body.emailAddress ,
                             phone: req.body.mobilePhone ,  
                             password: req.body.password,  
                             sponsor: req.body.sponsor ,   
                             sponsorType: req.body.sponsorType ,                        
                            }, function (err, r) {
            assert.equal(null, err);
            assert.equal(1, r.insertedCount);
             console.log("Inserted member");

            db.close();

        });
    });


    
   
   res.end("success");


})

var server = app.listen(8085, function () {

    var host = server.address().address
    var port = server.address().port

    console.log("Example app listening at http://%s:%s", host, port)

})
