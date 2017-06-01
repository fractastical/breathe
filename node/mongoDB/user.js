
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

        // Insert a single document
        db.collection('Membership').insertOne({ 
                             blockchainAddress: [{data: req.body.blockchainAddress, timeStamp: date}],
							 firstName: [{data: req.body.firstName, timeStamp: date}],
							 lastName: [{data: req.body.lastName, timeStamp: date}] ,
                             email: [{data: req.body.emailAddress, timeStamp: date}] ,
                             phone: [{data: req.body.mobilePhone, timeStamp: date}] ,  
                             password: [{data: req.body.password, timeStamp: date}] ,  
                             sponsor:[{data: req.body.sponsor, timeStamp: date}] ,                            
                             comments:    [{data: "Application submitted by applicant", timeStamp: date}],                         
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
