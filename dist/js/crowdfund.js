"use strict";

var crowdFundingContrat;
var crowdFundingHandle;
var swarmTokenContract
var swarmTokenHandle;
var currAccount;
var Web3;
var web3;
var gasPrice;
var gasAmount;
var exchangeUSD;
var SWARM_PriceBTC;
var SWARM_PriceETH;
var SWARM_PriceUSD;
var actionButton;


function init() {
    var proposal,
        mode,
        newProposalInput,
        newRegistration,
        newProposalButton,
        loginButton,
        newRegistrationButton,
        rulesChangeButton,
        investButton;

    currAccount = getCookie("account");

    $("#title-brand").text(organizationName);
    $("#page-title").text(organizationName);
    $("#logo-title-link").html('<a href="http://' + domain + '" class="simple-text">' + organizationName + ' </a>');
    $("#logo-mini-link").html('<a href="http://' + domain + '" class="simple-text">' + organizationName + ' </a>');

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

    gasPrice = web3.eth.gasPrice;
    gasAmount = 4000000;

    crowdFundingContract = web3.eth.contract(crowdFundingABI);
    crowdFundingHandle = crowdFundingContrat.at(crowdFundingAddress);

    swarmTokenContract = web3.eth.contract(tokenContractABI);
    swarmTokenHandle = swarmTokenContract.at(tokenContractAddress);

    //gasPrice = web3.eth.gasPrice;
    gasPrice = 20000000000;
    gasAmount = 4000000;

    currAccount = adminAccount;

    renderPage();
}


function renderPage() {
    if (window.location.href.indexOf("index.html") > 0) renderDashBoard();
}


function renderDashBoard() {
    // calculate number of tokens owned by logged user
    var tokenBalance = swarmTokenHandle.balanceOf(currAccount) / Math.pow(10, 10);

    var tokenBalance = (tokenBalance).formatMoney(5, '.', ',');
    $("#token-balance").html("<b>You hold " + tokenBalance + " SWARM</b>")

    // calculate nuymber of days left for crowd funding
    var daysLeft = convertTimestamp(crowdFundingHandle.endBlock());

    var today = new Date();
    var date2 = new Date(today);
    var date1 = new Date(daysLeft);
    var timeDiff = Math.abs(date2.getTime() - date1.getTime());
    var dayDifference = Math.ceil(timeDiff / (1000 * 3600 * 24));

    $("#days-left").html(dayDifference);

    // calculate number of participants so far
    var numberOfInvestors = Number(crowdFundingHandle.etherInvestors()) + Number(crowdFundingHandle.bitcoinInvestors());

    $("#investors-number").html(numberOfInvestors);

    // calculate USD received
    $.get("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD",
        function (data, status) {
            if (status == "success") {
                // var myObj = JSON.parse(data);
                // var length = Object(myObj).length;

                exchangeUSD = data.USD;

                $.get("https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=ETH",
                    function (data, status) {
                        if (status == "success") {
                            // var myObj = JSON.parse(data);
                            // var length = Object(myObj).length;

                            var exchangBTC_ETH = data.ETH;
                            var exchangeETH_BTC = 1 / exchangBTC_ETH;

                            // draw timeline
                            var tokensEther = Number(crowdFundingHandle.SWARMSentToETH());
                            var tokensBitcoin = Number(crowdFundingHandle.SWARMSentToBTC());
                            var toknesReferres = Number(crowdFundingHandle.SWARMSentToRef());

                            var totalTokensSold = (tokensEther + tokensBitcoin) / Math.pow(10, 10);

                            var percentSold = Math.round(totalTokensSold * 100 / 20000000);

                            var bar = $('#bar');
                            bar.barIndicator();
                            var newData = percentSold;
                            bar.barIndicator('loadNewData', [newData]);
                            bar.barIndicator('reanimateBar');

                            // calculate current SWARM price
                            SWARM_PriceBTC = calculateSWARMPrice(totalTokensSold);
                            SWARM_PriceETH = SWARM_PriceBTC * exchangBTC_ETH;
                            SWARM_PriceUSD = SWARM_PriceBTC * exchangeUSD;

                            $("#current-price").text("Current Price: " + (SWARM_PriceBTC).formatMoney(6, '.', ',') + " BTC");
                            $("#price-eth").text((SWARM_PriceETH).formatMoney(6, '.', ','));
                            $("#price-btc").text((SWARM_PriceBTC).formatMoney(6, '.', ','));
                            $("#price-usd").text((SWARM_PriceUSD).formatMoney(6, '.', ','));

                            // calculate BTC received
                            var BTCReceived = crowdFundingHandle.BTCReceived() / Math.pow(10, 8);
                            var BTCFromETH = crowdFundingHandle.ETHReceived() * exchangeETH_BTC / Math.pow(10, 18);

                            var totalBTC = Number(BTCReceived) + Number(BTCFromETH);
                            var totalUSD = totalBTC * exchangeUSD;


                            $("#btc-received").html((totalBTC).formatMoney(5, '.', ',') + " BTC");
                            $("#usd-received").html((totalUSD).formatMoney(2, '.', ',') + " USD invested so far.");
                        }
                    });
            }
        });
}

function calculateSWARMPrice(totalTokensSold) {
    var tokenPriceSatoshi;

    if (totalTokensSold <= (2500000))
        tokenPriceSatoshi = 6700;
    else if (totalTokensSold > (2500000) && totalTokensSold <= (5000000))
        tokenPriceSatoshi = 33000;
    else if (totalTokensSold > (5000000) && totalTokensSold <= (7500000))
        tokenPriceSatoshi = 80000;
    else if (totalTokensSold > (7500000) && totalTokensSold <= (10000000))
        tokenPriceSatoshi = 173300;
    else if (totalTokensSold > (10000000) && totalTokensSold <= (12500000))
        tokenPriceSatoshi = 290000;
    else if (totalTokensSold > (12500000) && totalTokensSold <= (15000000))
        tokenPriceSatoshi = 430000;
    else if (totalTokensSold > (15000000) && totalTokensSold <= (17500000))
        tokenPriceSatoshi = 593300;
    else tokenPriceSatoshi = 780000;

    return tokenPriceSatoshi / Math.pow(10, 8);
}


function showSendingAddress(){
    $("#areYouSure").modal('toggle');
    var amount = $("#parm1").val();
    $("#sending-amount").text(amount);
    $("#sending-address").text(crowdFundingAddress);
    $("#qrcode").text("");
    var qrcode = new QRCode("qrcode");
    qrcode.makeCode(crowdFundingAddress);
    $("#noticeModal").modal();
}

Number.prototype.formatMoney = function (c, d, t) {
    var n = this,
        c = isNaN(c = Math.abs(c)) ? 2 : c,
        d = d == undefined ? "." : d,
        t = t == undefined ? "," : t,
        s = n < 0 ? "-" : "",
        i = String(parseInt(n = Math.abs(Number(n) || 0).toFixed(c))),
        j = (j = i.length) > 3 ? j % 3 : 0;
    return s + (j ? i.substr(0, j) + t : "") + i.substr(j).replace(/(\d{3})(?=\d)/g, "$1" + t) + (c ? d + Math.abs(n - i).toFixed(c).slice(2) : "");
};

function getCookie(cname) {
    var name = cname + "=", ca = document.cookie.split(';'), i, c;

    for (i = 0; i < ca.length; i += 1) {
        c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}



function convertTimestamp(timestamp) {
    var d = new Date(timestamp * 1000),	// Convert the passed timestamp to milliseconds
        yyyy = d.getFullYear(),
        mm = ('0' + (d.getMonth() + 1)).slice(-2),	// Months are zero based. Add leading 0.
        dd = ('0' + d.getDate()).slice(-2),			// Add leading 0.
        hh = d.getHours(),
        h = hh,
        min = ('0' + d.getMinutes()).slice(-2),		// Add leading 0.
        sec = d.getSeconds(),
        ampm = 'AM',
        time;


    yyyy = ('' + yyyy).slice(-2);

    if (hh > 12) {
        h = hh - 12;
        ampm = 'PM';
    } else if (hh === 12) {
        h = 12;
        ampm = 'PM';
    } else if (hh == 0) {
        h = 12;
    }

    // ie: 2013-02-18, 8:35 AM
    time = yyyy + '-' + mm + '-' + dd + ', ' + h + ':' + min + ' ' + ampm;
    time = mm + '/' + dd + '/' + yyyy + '  ' + h + ':' + min + ':' + sec + ' ' + ampm;

    return time;
}

function formatNumber(number) {
    number = number.toFixed(0) + '';
    var x = number.split('.');
    var x1 = x[0];
    var x2 = x.length > 1 ? '.' + x[1] : '';
    var rgx = /(\d+)(\d{3})/;
    while (rgx.test(x1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
    }
    return x1 + x2;
}

function setFormValidation(id) {
    $(id).validate({
        errorPlacement: function (error, element) {
            $(element).parent('div').addClass('has-error');
        }
    });
}


$(document).on('submit', '#save-sending-address', function (e) {
    if (e.isDefaultPrevented()) {
        // handle the invalid form...
    } else {
        e.preventDefault();
        showSendingAddress();
    }
});


$(document).ready(function () {
    setFormValidation('#save-sending-address');
    var inputBox = document.getElementById('contribution');
    inputBox.onkeyup = function(){
        document.getElementById('contribution-print').innerHTML = "You will get "  + (Number(inputBox.value) / SWARM_PriceETH).formatMoney(5, '.', ',') + " SWARM";
    }


    var opt = {

      numMinLabel: false,
      horTitle: 'Sold',
      horLabelPos: "topLeft",

      animTime: 100,
      milestones: {
        1: {
          mlPos: 0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$0.10',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        },
        2: {
          mlPos: 12.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$0.40',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        },
        3: {
          mlPos: 24.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$0.70',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        }
        ,
        4: {
          mlPos: 36.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$1.40',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        }
        ,
        5: {
          mlPos: 48.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$1.75',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        }
        ,
        6: {
          mlPos: 60.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$2.10',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        }
        ,
        7: {
          mlPos: 72.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$2.45',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        }
        ,
        8: {
          mlPos: 84.0,
          mlId: false,
          mlClass: 'bi-middle-mlst',
          mlDim: '200%',
          mlLabel: '$2.80',
          mlLabelVis: 'hover',
          mlHoverRange: 15,
          mlLineWidth: 3
        }
      }
    };

    $('#bar').barIndicator(opt);

    // handle invest window
    $("#invest").click(function () {
        // actionButton = document.getElementById("modal-action-areyousure");
        // actionButton.addEventListener('click', showSendingAddress);
        var contribution = $("#contribution").val();
        $("#parm1").val(contribution);
         $("#sending-address").text("");
        $("#areYouSure").modal();
    });
})
