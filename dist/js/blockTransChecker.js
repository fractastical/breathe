var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var Web3 = require('web3'); // https://www.npmjs.com/package/web3
var adminAddress = 'xxxx...............';
var adminPassword = 'xxxxx';
var contractAddress = "0xF03511d08b655Bf875152c1553Eb86F141A9035D";
var etherscanURL = "http://testnet.etherscan.io/";

var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;
  


var contractABI =[{"constant":true,"inputs":[],"name":"SWARM_reserve","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"endBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"maxCap","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"etherInvestors","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"minInvestETH","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"minCap","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"kill","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"startBlock","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"finalize","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"ETHReceived","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"emergencyStop","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"_SWARMAddress","type":"address"}],"name":"updateTokenAddress","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"payThroghRef","outputs":[{"name":"","type":"bool"}],"payable":true,"type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"investors","outputs":[{"name":"weiReceived","type":"uint256"},{"name":"SWARMSent","type":"uint256"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"stopped","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"multisigETH","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"team","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"release","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"swarm","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"drain","outputs":[],"payable":false,"type":"function"},{"constant":false,"inputs":[],"name":"start","outputs":[],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"maxCapReached","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"crowdsaleClosed","outputs":[{"name":"","type":"bool"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"reserve","outputs":[{"name":"","type":"address"}],"payable":false,"type":"function"},{"constant":true,"inputs":[],"name":"SWARMSentToETH","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},{"constant":false,"inputs":[{"name":"newOwner","type":"address"}],"name":"transferOwnership","outputs":[],"payable":false,"type":"function"},{"inputs":[],"payable":false,"type":"constructor"},{"payable":true,"type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"investor","type":"address"},{"indexed":false,"name":"amount","type":"uint256"},{"indexed":false,"name":"tokenAmount","type":"uint256"}],"name":"ReceivedETH","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"investor","type":"address"},{"indexed":false,"name":"tokenAmount","type":"uint256"},{"indexed":false,"name":"priceSatoshi","type":"uint256"}],"name":"PriceRangeCalculated","type":"event"}]




var web3 = new Web3();
web3.setProvider(new web3.providers.HttpProvider('http://localhost:8545'));



String.prototype.toHHMMSS = function () {
    var sec_num = parseInt(this, 10); // don't forget the second param
    var hours = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
    var hoursInt = hours;
    var days = Math.floor(hours / 24);

    if (hours < 10) { hours = "0" + hours; }
    if (minutes < 10) { minutes = "0" + minutes; }
    if (seconds < 10) { seconds = "0" + seconds; }

    if (hoursInt < 0) { return "Start new bidding" }
    else if (days == 0) {
        return hours + ':' + minutes + ':' + seconds;
    }
    else
        return days + " days";
}



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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);

  // Pass to next layer of middleware
  next();
});



app.post('/checktrans.htm', function (req, res) {
  res.sendFile(__dirname + "/" + "checktrans.htm");
})

//Unlock admin account for the development


app.post('/get_transactions', function (req, res) {

    var blockNum = req.body.blockNum;
    console.log("Block Num: " + blockNum);

    var contrat = web3.eth.contract(contractABI);
    var contractHandle = contrat.at(contractAddress);
    var finished = false;
    var transactionRubyUpdate = "http://localhost:3000/transactions/validate_new_transactions";
    var transactionRubyLatestBlock = "http://localhost:3000/transactions/latest_block";

    var xhttp = new XMLHttpRequest();

    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            // Typical action to be performed when the document is ready:
            // document.getElementById("demo").innerHTML = xhttp.responseText;
            console.log("Response: " + xhttp.responseText);
            blockNum = xhttp.responseText;
            console.log("Block No: " + xhttp.responseText);
        }
    };
    xhttp.open("GET", transactionRubyLatestBlock, true);
    console.log("URL: " + transactionRubyLatestBlock);
    xhttp.send();


    Allevents = contractHandle.allEvents({
        fromBlock: blockNum,
        toBlock: 'latest'
    });

    Allevents.watch(function (error, events) {

       
        if (!error) {
            if (events.event == "ReceivedETH" && !finished) {
              
                var xhttp = new XMLHttpRequest();
                xhttp.onreadystatechange = function () {
                    if (this.readyState == 4 && this.status == 200) {
                        // Typical action to be performed when the document is ready:
                        // document.getElementById("demo").innerHTML = xhttp.responseText;
                        console.log("Response: " + xhttp.responseText);
                        console.log("URL: " + transactionRubyUpdate + "?amount=" + events.args.amount + "&swarmAmount=" + events.args.tokenAmount + "&investorAddress=" + events.args.investor + "&blockNo=" + events.blockNumber + "&transaction=" + events.transactionHash);
                    }                                        
                };
                xhttp.open("PUT", transactionRubyUpdate + "?amount=" + events.args.amount + "&swarmAmount=" + events.args.tokenAmount + "&investorAddress=" + events.args.investor + "&blockNo=" + events.blockNumber + "&transaction=" + events.transactionHash, true);                
                xhttp.send();

                var block = web3.eth.getBlock(events.blockNumber, true);

                if (block.timestamp == 1) {

                    // stopWatching doesn't fire imediatelly and exectues one additionl loop occasionally                                  
                    Allevents.stopWatching();
                }
            }
        }
    });

    res.end("0");
})


var server = app.listen(8081, function () {

  var host = server.address().address
  var port = server.address().port

  console.log("App listening at http://%s:%s", host, port)

})
