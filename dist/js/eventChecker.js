 // Checks Web3 support
 if (typeof web3 !== 'undefined' && typeof Web3 !== 'undefined') {
     // If there's a web3 library loaded, then make your own web3
     web3 = new Web3(web3.currentProvider);
 } else if (typeof Web3 !== 'undefined') {
     // If there isn't then set a provider
     //var Method = require('./web3/methods/personal');
     web3 = new Web3(new Web3.providers.HttpProvider(connectionString));

     if (!web3.isConnected()) {

         $("#alert-danger-span").text(" Problem with connection to the newtwork. Please contact " + supportEmail + " abut it. ");
         $("#alert-danger").show();
         return;
     }
 } else if (typeof web3 == 'undefined' && typeof Web3 == 'undefined') {
     Web3 = require('web3');
     web3 = new Web3();
     web3.setProvider(new web3.providers.HttpProvider(connectionString));
 }


 crowdFundingContract = web3.eth.contract(crowdFundingABI);
 crowdFundingHandle = crowdFundingContract.at(crowdFundingAddress);

 swarmTokenContract = web3.eth.contract(tokenContractABI);
 swarmTokenHandle = swarmTokenContract.at(tokenContractAddress);
 var finished = false;



 var startingBlock = $("#last-block").val();

 Allevents = contractHandle.allEvents({
     fromBlock: startingBlock,
     toBlock: 'latest'
 });

 $("#progress").html('Creating report..<i class="fa fa-spinner fa-spin" style="font-size:28px;color:green"></i>');
 Allevents.watch(function (error, events) {
     if (!error) {
         if (events.event == "ReceivedETH" && !finished) {
             i++;

             if (events.args.lastBidTime == 0) var timeDiff = "0";

             else timeDiff = (events.args.currentBidTime - events.args.lastBidTime).toString().toHHMMSS()


             $.post(transactionRuby, {
                     amount: events.args.amount,
                     swarmAmount: events.args.tokenAmount,
                     investorAddress: events.args.investor
                 },
                 function (data, status) {

                     if (data != "" && status == "success") {
                         $("#audit-trail-table").append(data);
                         $("#progress").html('');

                     }
                 });
         }

         var block = web3.eth.getBlock(events.blockNumber, true);

         if (block.timestamp == lastBidTime) {

             // stopWatching doesn't fire imediatelly and exectues one additionl loop occasionally                                            
             Allevents.stopWatching();
            
         }
     } else   console.log(error);
 });


 