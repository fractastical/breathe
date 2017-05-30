var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require('web3'); // https://www.npmjs.com/package/web3
var adminAddress = '0x6C88e6C76C1Eb3b130612D5686BE9c0A0C78925B';
var adminPassword = '111111';


var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));

app.use(express.static('public'));

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));

// parse application/json
app.use(bodyParser.json());

// Add headers
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');

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




app.get('/index.htm', function (req, res) {
  res.sendFile(__dirname + "/" + "index.htm");
})

app.get('/unlockAcc.html', function (req, res) {
  res.sendFile(__dirname + "/" + "unlockAcc.html");
})



app.post('/unlock_acc', function (req, res) {


  web3.personal.unlockAccount(adminAddress, adminPassword, 30);

  console.log("Admin account unlocked");
  
  res.end();


})

app.post('/process_get', function (req, res) {



  console.log("Password passed: " + req.body.password);
  var keythereum = require("keythereum");
  //var path = "/home/bogdan/Ethereum/privateTestnet/keystore";
  var path = "/home/bogdan/.ethereum/testnet/keystore/";

  var dk = keythereum.create();
  var keyObject = keythereum.dump(req.body.password, dk.privateKey, dk.salt, dk.iv);
  var jsonObject = keythereum.exportToFile(keyObject, path);

  console.log(keyObject.address);
  console.log("Password " + req.body.password);

  web3.personal.unlockAccount(adminAddress, adminPassword, 30);

  console.log("Admin account unlocked");
  res.end(keyObject.address);


})

var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("App listening at http://%s:%s", host, port)

})
