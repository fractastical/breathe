//TODO: Separation of concerns and DRY code (the ABI exists in another file)

var crowdFundingABI =[ { "constant": false, "inputs": [ { "name": "_rate", "type": "uint256" } ], "name": "setEthToBtcRate", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "SWARM_reserve", "outputs": [ { "name": "", "type": "uint256", "value": "1700000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "endBlock", "outputs": [ { "name": "", "type": "uint256", "value": "1498148910" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "maxCap", "outputs": [ { "name": "", "type": "uint256", "value": "200000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "etherInvestors", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "weiToSatoshi", "outputs": [ { "name": "", "type": "uint256", "value": "143287209000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "SWARMSentToRef", "outputs": [ { "name": "", "type": "uint256", "value": "26865671641790" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "BTCproxy", "outputs": [ { "name": "", "type": "address", "value": "0xa972ed74b34ae1d99713349c997f558f9b50c8d1" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "minInvestETH", "outputs": [ { "name": "", "type": "uint256", "value": "1000000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "minCap", "outputs": [ { "name": "", "type": "uint256", "value": "120000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "kill", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "startBlock", "outputs": [ { "name": "", "type": "uint256", "value": "1495556910" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "finalize", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "receiveApproval", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "ETHReceived", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "withdrawPayments", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "emergencyStop", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "investors", "outputs": [ { "name": "weiReceived", "type": "uint256", "value": "0" }, { "name": "BTCaddress", "type": "string", "value": "" }, { "name": "satoshiReceived", "type": "uint256", "value": "0" }, { "name": "SWARMSent", "type": "uint256", "value": "0" }, { "name": "sponsor", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "bitcoinInvestors", "outputs": [ { "name": "", "type": "uint256", "value": "3" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "stopped", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "multisigETH", "outputs": [ { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "team", "outputs": [ { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "release", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x6c88e6c76c1eb3b130612d5686be9c0a0c78925b" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_investor", "type": "address" }, { "name": "_addressBTC", "type": "string" }, { "name": "_amount", "type": "uint256" }, { "name": "_transactionID", "type": "string" }, { "name": "_sponsor", "type": "address" }, { "name": "_isAmbassador", "type": "bool" } ], "name": "handelBTC", "outputs": [ { "name": "res", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "swarm", "outputs": [ { "name": "", "type": "address", "value": "0xfb0caa5a324e5a878c8bc98ce1430976992a964c" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "drain", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "SWARMSentToBTC", "outputs": [ { "name": "", "type": "uint256", "value": "67164179104477" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_sponsor", "type": "address" }, { "name": "_isAmbassador", "type": "bool" } ], "name": "payThroghRef", "outputs": [ { "name": "", "type": "bool" } ], "payable": true, "type": "function" }, { "constant": true, "inputs": [], "name": "BTCReceived", "outputs": [ { "name": "", "type": "uint256", "value": "45000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "minInvestBTC", "outputs": [ { "name": "", "type": "uint256", "value": "5000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "start", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "maxCapReached", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "crowdsaleClosed", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "reserve", "outputs": [ { "name": "", "type": "address", "value": "0x0000000000000000000000000000000000000000" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "sponsors", "outputs": [ { "name": "referral", "type": "address", "value": "0x0000000000000000000000000000000000000000" }, { "name": "weiReferred", "type": "uint256", "value": "0" }, { "name": "satoshiReferred", "type": "uint256", "value": "0" }, { "name": "isAmbassador", "type": "bool", "value": false }, { "name": "tokensSent", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "SWARMSentToETH", "outputs": [ { "name": "", "type": "uint256", "value": "26865671641790" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "", "type": "address" } ], "name": "payments", "outputs": [ { "name": "", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_amount", "type": "uint256" } ], "name": "computeTokensToSend", "outputs": [ { "name": "res", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "type": "function" }, { "inputs": [ { "name": "SWARMaddress", "type": "address", "index": 0, "typeShort": "address", "bits": "", "displayName": " S W A R Maddress", "template": "elements_input_address", "value": "" } ], "payable": false, "type": "constructor" }, { "payable": true, "type": "fallback" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "investor", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "tokenAmount", "type": "uint256" } ], "name": "ReceivedETH", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "investor", "type": "address" }, { "indexed": false, "name": "from", "type": "string" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "txid", "type": "string" }, { "indexed": false, "name": "tokenAmount", "type": "uint256" } ], "name": "ReceivedBTC", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "to", "type": "string" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "RefundBTC", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "member", "type": "address" }, { "indexed": false, "name": "referral", "type": "address" }, { "indexed": false, "name": "amount", "type": "uint256" }, { "indexed": false, "name": "btcOrEth", "type": "uint256" }, { "indexed": false, "name": "ambasador", "type": "bool" }, { "indexed": false, "name": "tokensEarned", "type": "uint256" } ], "name": "ReferralProcessed", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": false, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "RefundETH", "type": "event" } ]


var tokenContractABI =[ { "constant": true, "inputs": [], "name": "name", "outputs": [ { "name": "", "type": "string", "value": "SWARM Token" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "approve", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [ { "name": "", "type": "uint256", "value": "200000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transferFrom", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [ { "name": "", "type": "uint8", "value": "9" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "initialSupply", "outputs": [ { "name": "", "type": "uint256", "value": "200000000000000000" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_value", "type": "uint256" } ], "name": "burn", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "version", "outputs": [ { "name": "", "type": "string", "value": "v0.1" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" } ], "name": "balanceOf", "outputs": [ { "name": "balance", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [ { "name": "", "type": "address", "value": "0x6c88e6c76c1eb3b130612d5686be9c0a0c78925b" } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [ { "name": "", "type": "string", "value": "SWARM" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [], "name": "unlock", "outputs": [], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" } ], "name": "transfer", "outputs": [ { "name": "", "type": "bool" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }, { "name": "_extraData", "type": "bytes" } ], "name": "approveAndCall", "outputs": [], "payable": false, "type": "function" }, { "constant": true, "inputs": [], "name": "locked", "outputs": [ { "name": "", "type": "bool", "value": false } ], "payable": false, "type": "function" }, { "constant": true, "inputs": [ { "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" } ], "name": "allowance", "outputs": [ { "name": "remaining", "type": "uint256", "value": "0" } ], "payable": false, "type": "function" }, { "constant": false, "inputs": [ { "name": "newOwner", "type": "address" } ], "name": "transferOwnership", "outputs": [], "payable": false, "type": "function" }, { "inputs": [], "payable": false, "type": "constructor" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [ { "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" } ], "name": "Approval", "type": "event" } ]
//var connectionString = "http://184.68.74.253:8545";
var connectionString = "http://localhost:8545";

//var contractAddress = '0xF50B3bd709Ba152b31d499d9c34C380B26E305a9';
//var contractAddressTestnet = contractAddress;
var adminAccount = '0x6C88e6C76C1Eb3b130612D5686BE9c0A0C78925B';
var supportEmail = "support@swarm.fund";
var organizationName = "Swarm";
//var nodejsUrl = "http://184.68.74.253:8081/process_get";
var nodejsUrl = "http://localhost:8081/process_get";
var tokenContractAddress = "0x261f54f3c6916581eDd881A37A80C2EE4C29876b";
//var memberAddress = "0xdbe5a78DDAE6be8B8097c6801B021d0B44d6863E";

var crowdFundingAddress  = "0x55f0AB8A7B935085Fcc62ea17Fe1904ab4bF7819";
var crowdFundingBTC_Addres = "18D9WCQyDSrsuuhNi7RwaqFWJGgAeMjm9Y";


var express = require('express');
var bodyParser = require('body-parser');
var schedule = require('node-schedule');
var fetch = require('node-fetch');
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

crowdFundingContract = web3.eth.contract(crowdFundingABI);
crowdFundingHandle = crowdFundingContract.at(crowdFundingAddress);

// Update swarmToSatoshi
// Make a call to CryptoCompare API to
// find out how many ETH per BTC
new_rate = "";
function retrieveEthToBtcRate(){
    let url = "https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=ETH"
    // Fetch the API url
    fetch(url).then(function(response) {
        return response.json();
    }).then(function(data) {
        new_rate = data.ETH;
        return new_rate;
    }).catch(function() {
        //TODO: Address the case when API call fails
    });
}

// Run setEthToBtcRate() (Crowdsale.sol) to
// update the conversion rate
function updateEthToBtcRate(rate){
    crowdFundingHandle.setEthToBtcRate(rate)
};

// Run stuff every 10 minutes
var ten_minute_cron = schedule.scheduleJob('*/1 * * * *', function(){
  console.log('I run every 10 minutes');
  retrieveEthToBtcRate();
  // Convert ETH to Wei
  setTimeout(function(){
    eth_to_wei = web3.toWei(new_rate, 'ether');
    //TODO test as BTCProxy
    updateEthToBtcRate(eth_to_wei);
  }, 2000);

});

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
