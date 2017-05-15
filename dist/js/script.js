"use strict";

var proposalHash, totalVotes, proposal, totalPro, totalAgainst, proposalID, beneficiary, etherAmount, jobDescription, userAccount, supportsProposal, proposalNumber, yea, nay, quorum, proposalPassed, canVote, firstName, lastName, userID, minimumSharesToPassAVote, minutesForDebate, nominatedAddress, sender, voteIndex, status, minimumMembers, numOfTokens, actionButton, proposalTitle, proposalDescription, buyer, creator, dateProposlaEntered, tokenAmountForProject, amountSpent, refernce;


var addr;



var startingBlock = 1800000;
var Web3;
var web3;
var logedIn = false;
var message;
var gasAmount;
var gasPrice;
var currAccount;
var supportEmail;
var token;
var eventsMinDistance = 50;
var timelines;
var memberContrat;
var memberHandle;
var ledgerHandle;
var ldHandle;
var singleTokenCost = 1000000000000000;
var valueIinFIAT;
var exchangeFIAT;
var totalTokens;
var tokenBalance;
var votingPower;
var ownedPercentage;
var accountBalance;


/**
  * This function is called every time html page is opened.
 * it initiates organization name on the html page and creates
 * web3 objects and establishes connection to the node.
 * it creates handle to the contract based on the contract interface
 * and contract address, which is located in interface.js 
 * it verifies balance of the user and executes appropriate load function
 * based on which html page it calls. 
 *
 * @method init
 * 
*/

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


    if (getCookie("emailAddress") != "") {
        $("#user-drop-down").prepend(getCookie("firstName") + " " + getCookie("lastName"));
        $("#menu-signup").hide();
        $("#menu-login").hide();
        $("#menu-signup").css("background-color", "lightgreen");
    }




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
        web3.setProvider(new web3.providers.HttpProvider(onnectionString));
    }



    var ldContradct = web3.eth.contract(ldABI);
    ldHandle = ldContradct.at(ldAddress);

    //gasPrice = web3.eth.gasPrice;
    gasPrice = 20000000000;
    gasAmount = 4000000;

    var etherTokenContract = web3.eth.contract(toeknContractABI);
    token = etherTokenContract.at(tokenContractAddress);

    checkBalance();
    enableMenu();
}


/**
 * It handles calling appropriate funcion basedon the page rendered.
 * @method renderPage
 * 
*/

function renderPage() {
    if (window.location.href.indexOf("adminStats.html") > 0) renderAdmin();
    else if (window.location.href.indexOf("adminMembers.html") > 0) renderMembers();
    else if (window.location.href.indexOf("myProfile.html") > 0) renderProfile();
    else if (window.location.href.indexOf("proposals.html") > 0) listProposals();
    else if (window.location.href.indexOf("adminProposals.html") > 0) renderAdminProposals();
    else if (window.location.href.indexOf("delegations.htm") > 0) renderMembers("delegate");
    else if (window.location.href.indexOf("index.html?ref=true") > 0) $("#modal-register").modal();
    else if (window.location.href.indexOf("funding.html") > 0) renderFunding();
}


/**
 * It is executed when myProfile.html is called
 * It will render html with Ethereum account for the user
 * and their email address 
 * 
 * @method renderProfile 
 * 
*/
function renderProfile() {



    var profileTable = "<tr><td>Ethereum address</td>" +
        "<td style='text-align:right'>" + getCookie("account") + "</td></tr>" +
        "<tr><td>First Name</td>" +
        "<td style='text-align:right'>" + getCookie("firstName") + "</td></tr>" +
        "<tr><td>Last Name</td>" +
        "<td style='text-align:right'>" + getCookie("lastName") + "</td></tr>" +
        "<tr><td>Email Address</td>" +
        "<td style='text-align:right'>" + getCookie("emailAddress") + "</td></tr>" +
        "<tr><td>Can Vote</td>" +
        "<td style='text-align:right'>" + getCookie("canvote") + "</td></tr>" +
        "<tr><td>Delegated Votes</td>" +
        "<td style='text-align:right'>" + getCookie("delegated") + "</td></tr>"


    $("#profile-table").append(profileTable);


}



/**
 * It is executed when adminMembers.html or delegations.html are called
 * It will call listMembers with the flag. 
 * 
 * @method renderMembers 
 * @param flag
 * 
*/

function renderMembers(flag) {

    if (getCookie("delegated") == 1) {
        $("#delegation-note").text("Click this button to withdraw delgation of your vote from the member which you delegated it to before.");
    } else {
        $("#withdraw-delegation").attr('disabled', 'disabled');
        $("#delegation-note").text("You are currently not delegating your votes.");
    }
    listMembers(flag);

}


/**
 * Admin can trigger this function to change price
 * of token, start and end date of token sale 
 * 
 * @method changeTokenParms 
 * 
*/

function changeTokenParms() {

    var minimumSharesToPassVote,
        minutesForDebate,
        minMembers, TokenPrice, startDate, endDate;



    if (!handlePassword("modal-change-token-parms", 0)) return;

    var newTokenPrice = document.getElementById("new-token-price").value;
    var newTokenSaleStartDate = document.getElementById("new-token-sale-start-date").value

    if (newTokenSaleStartDate != "")
        newTokenSaleStartDate = convertDateToTimeStamp(newTokenSaleStartDate);

    var newTokenSaleEndtDate = document.getElementById("new-token-sale-end-date").value;
    if (newTokenSaleEndtDate != "")
        newTokenSaleEndtDate = convertDateToTimeStamp(newTokenSaleEndtDate);

    progressActionsBefore();

    setTimeout(function () {

        ldHandle.changeTokenParms(newTokenSaleStartDate, newTokenSaleEndtDate, newTokenPrice, { from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logTokensParmChange = ldHandle.TokenParmsChange({ start: startDate }, { end: endDate }, { tokenPrice: TokenPrice });

        logTokensParmChange.watch(function (error, res) {
            var message = "New parms successfully applied to tokens.";
            progressActionsAfter(message, true);
        });
    }, 10);

}


/**
 * It will list members and based on the flag will show
 * and hide certain collumns to represent context

 * 
 * @method listMembers 
 * @param action
 * 
*/

function listMembers(action) {

    var htmlString,
        delegated,
        i,
        member,
        memberNumberToDisplay,
        voteStrength,
        htmlString;

    setTimeout(function () {


        var numMembers = ldHandle.numMembers();


        if (numMembers > 0) {
            htmlString = "<div class='table-responsive'><table  class='table  table-hover' style ='width: 90%;' id='responstable' align='center'>" +
                "<tr>" +
                "<th>User Name</th>" +
                "<th>Date Joined</th>" +
                "<th>Can Vote</th>" +
                "<th>User ID</th>" +
                "<th style='text-align:center'>Voting Power</th>" +
                "<th>Delegate Status</th>" +
                "<th style='text-align:center'>Delegate</th>" +
                "<th>Ban/Unban</th>" +
                "<th>Make admin</th>" +
                "<th>Add tokens</th>" +
                "</tr>";
            delegated = getCookie("delegated");

            for (i = numMembers - 1; i >= 0; i -= 1) {
                member = ldHandle.members(i, { from: adminAccount });
                voteStrength = ldHandle.voteWeight(member[0], { from: adminAccount })
                memberNumberToDisplay = i + 1;
                var firstLastName = member[3] + "+" + member[4]

                htmlString += "<tr>" +
                    "<td style='text-align:left'>" + member[3] + " " + member[4] + " </td>" +
                    "<td style='text-align:right'>" + convertTimestamp(member[2]) + "</td>" +
                    "<td>" + member[1] + "</td>" +
                    "<td>" + member[5] + "</td>";


                if (member[6]) {
                    htmlString += "<td align='center'> <font color='red'><B>" + voteStrength + "</B></font></td>";
                    htmlString += "<td align='center'> <font color='red'><B>" + member[6] + "</B></font></td>";

                }
                else {
                    htmlString += "<td align='center'>" + voteStrength + "</td>";
                    htmlString += "<td align='center'>" + member[6] + "</td>";
                }

                if (delegated == 1 || member[0] == currAccount || delegated == "1") {
                    htmlString += '<td align="center"><img style="max-width:42px;" src="../dist/img/no.png" alt="Not allowed" title="Not allowed" align="top" height="42" width="42"></td>';
                } else {
                    htmlString += "<td align='center'> <a class='linkDelegateClass' data-toggle='modal' id='urldelegate" + i + "' href='index.html?mode=d&pn=" + i + "&ui=" + member[5] + "&mi=" + member[0] + "&flname=" + firstLastName + "#myModal' title='Delegate your vote'>"
                        + "<img  style='max-width:42px;' src='../dist/img/delegate.png' alt='Delegate Vote' title='Delegate Vote' align='top'></td>";

                }
                //display icons for blocking and unblocking members
                //show not allowed for non admin
                if (getCookie("admin") == 0 || member[0] == currAccount) {
                    htmlString += '<td align="center"><img style="max-width:42px;" src="../dist/img/no.png" alt="Not allowed" title="Not allowed" align="top" height="42" width="42"></td>';

                } else {

                    if (member[1]) {
                        htmlString += "<td align='center'> <a class='linkbanClass' data-toggle='modal' id='urlban" + i + "' href='index.html?mode=0&pn=" + i + "&mi=" + member[0] + "&action=0&flname=" + firstLastName + "#myModal' title='Block member'>"
                            + "<img style='max-width:42px;' src='../dist/img/allow.png' alt='Block member' title='Block member' align='top' ></td>";
                    }
                    else {
                        htmlString += "<td align='center'> <a class='linkbanClass' data-toggle='modal' id='urlban" + i + "' href='index.html?mode=1&pn=" + i + "&mi=" + member[0] + "&action=1&flname=" + firstLastName + "#myModal' title='Unblock member'>"
                            + "<img  style='max-width:42px;' src='../dist/img/ban.png' alt='Unblock member' title='Unblock member' align='top' ></td>";

                    }
                }

                if (member[8] || getCookie("admin") == 0) {
                    htmlString += '<td align="center"><img style="max-width:42px;" src="../dist/img/no.png" alt="Not allowed" title="Not allowed" align="top" height="42" width="42"></td>';
                }
                else {

                    htmlString += "<td align='center'> <a class='linkAdminClass' data-toggle='modal' id='urladmin" + i + "' href='index.html?mode=admin&pn=" + i + "&mi=" + member[0] + "&flname=" + firstLastName + "#myModal' title='Transfer ownership'>"
                        + "<img style='max-width:42px;' src='../dist/img/admin.png' alt='Transfer ownership' title='Transfer ownership	' align='top'></td>";
                }

                htmlString += "<td align='center'> <a class='linkAdminTokens' data-toggle='modal' id='urladmin" + i + "' href='index.html?mode=admin&pn=" + i + "&mi=" + member[0] + "&flname=" + firstLastName + "#myModal' title='Add more tokens'>"
                    + "<img style='max-width:42px;' src='../dist/img/add.png' alt='Add more tokens' title='Add tokens' align='top'></td></tr>";



            }

            htmlString += "</table></div>";
            $("#list-text").text("Members list");
            $("#member-table").html(htmlString);

            if (action == "delegate") {

                $('#responstable tr > *:nth-child(2)').hide();
                $('#responstable tr > *:nth-child(3)').hide();
                $('#responstable tr > *:nth-child(4)').hide();
                $('#responstable tr > *:nth-child(6)').hide();
                $('#responstable tr > *:nth-child(8)').hide();
                $('#responstable tr > *:nth-child(9)').hide();
                $('#responstable tr > *:nth-child(10)').hide();
            } else if (action == "ban") {

                $('#responstable tr > *:nth-child(6)').hide();
                $('#responstable tr > *:nth-child(7)').hide();
                $('#responstable tr > *:nth-child(9)').hide();

            } else if (action == "transferadmin") {

                $('#responstable tr > *:nth-child(6)').hide();
                $('#responstable tr > *:nth-child(7)').hide();
                $('#responstable tr > *:nth-child(8)').hide();

            } else if (action == "front") {

                $('#responstable tr > *:nth-child(7)').hide();
                $('#responstable tr > *:nth-child(8)').hide();
                $('#responstable tr > *:nth-child(9)').hide();

            }

        }
    }, 3);

}

/**
 * It is executed when proposals.html is called
 * It will render current proposals in the system
 * 
 * @method listProposals 
 * 
*/

function listProposals() {


    var numProposals,
        numRegisteredMembers,
        i,
        closedMessage = "";

    setTimeout(function () {

        numProposals = ldHandle.numProposals();
        $("#list-body").html("<BR><i>*Click vote down or vote up icon to vote</i><BR><BR><BR>");

        if (numProposals > 0) {

            var htmlString = "<div class='table-responsive'><table id='proposals' class='table table-hover'  id='responstable' align='center'>" +
                "<tr>" +
                "<th>No.</th>" +
                "<th style='width:30%;'>Proposal title</th>" +
                "<th style='width:30%;'>Proposal Description</th>" +
                "<th ><span  class='glyphicon glyphicon-time'></th>" +
                "<th>Yes</th>" +
                "<th>No</th>" +
                "<th ><span  class='glyphicon glyphicon-info-sign'></th>" +
                "<th ><span  class='glyphicon glyphicon-pencil'></th>" +
                "<th ><span  class='glyphicon glyphicon-stats'></th>" +
                "<th ><span  class='glyphicon glyphicon-education'></th>" +
                "</tr>";

            for (i = numProposals - 1; i >= 0; i -= 1) {
                var result,
                    proposalNumberToDisplay;

                result = ldHandle.proposals(i);
                proposalNumberToDisplay = i + 1;

                htmlString += "<tr>" +
                    "<td>" + proposalNumberToDisplay + " </td>" +
                    "<td style='word-wrap: break-word; white-space:normal;' align='left;' width='30%'>" + result[3] + " </td>" +
                    "<td style='word-wrap: break-word; white-space:normal;' align='left;' width='30%'>" + result[2] + " </td>" +
                    "<td><div  style='float:left; font-size: 10px; color:red;' id='timemessage" + i + "'>&nbsp;</div></td>" +
                    "<td><a data-toggle='modal' id='urlvup" + i + "'   href='index.html?mode=v&pn=" + i + "&up=true#myModal' title='Vote Up' class='linkVoteClass'> <img align = 'top' id='voteup" + i + "' src='../dist/img/voteup.png' alt ='Vote Up' height='40' width='43'></a></td>" +
                    "<td><a data-toggle='modal' id='urlvdown" + i + "' href='index.html?mode=v&pn=" + i + "&up=false#myModal' title='Vote Down' class='linkVoteClass'><img id='votedown" + i + "' src='../dist/img/votedown.png'  alt='Vote down' height='40' width='43'></a> </td>" +
                    "<td><a data-toggle='modal' id='p-info" + i + "'   href='index.html?mode=r&pn=" + i + "#myModal' title='View proposal info' class='linkProposalViewClass'><img src='../dist/img/view.png' height='38' width='38' alt='View' ></a></td>" +
                    "<td><a data-toggle='modal' id='urlsum" + i + "'   href='index.html?mode=s&pn=" + i + "#myModal' title='Sum results' class='linkTallyClass'><img id='sum" + i + "' src='../dist/img/gavel.png' height='38' width='38' alt='Sum results'></a></td>" +
                    "<td id='updown" + i + "'></td>" +
                    "<td id='yesno" + i + "'></td>" +
                    "</tr>"

            }

            htmlString += "</table></div>"

            $("#proposal-table").append(htmlString);


            for (i = numProposals - 1; i >= 0; i -= 1) {

                var result,
                    proposalNumberToDisplay;

                result = ldHandle.proposals(i);
                proposalNumberToDisplay = i + 1;

                // check if voting deadline has passed
                var deadline = result[5];
                var nowInseconds = Date.now() / 1000;

                if (nowInseconds >= deadline) {

                    document.getElementById("sum" + i).style.opacity = "1";
                    document.getElementById("urlsum" + i).style.pointerEvents = "index.html?mode=s&pn=" + i;
                    document.getElementById("voteup" + i).style.opacity = "0.1";
                    document.getElementById("votedown" + i).style.opacity = "0.1";
                    document.getElementById("urlvup" + i).style.pointerEvents = "none";
                    document.getElementById("urlvdown" + i).style.pointerEvents = "none";
                    document.getElementById("timemessage" + i).innerHTML = "CLOSED <BR>for voting"
                } else {
                    var start1 = document.getElementById("timemessage" + i);
                    var tempMessageID = "timemessage" + i;
                    var timeLeft = (deadline - nowInseconds).toString().toHHMMSS();
                    countdown(tempMessageID, timeLeft, deadline);
                }

                // check if proposl can be still voted on
                // make sure that tally button is disabled

                if (deadline - nowInseconds > 0) {

                    document.getElementById("sum" + i).style.opacity = "0.1";
                    document.getElementById("urlsum" + i).style.pointerEvents = "none";
                }

                // check if proposal has been executed
                if (result[6] > 0) {
                    document.getElementById("sum" + i).style.opacity = "0.1";
                    document.getElementById("urlsum" + i).style.pointerEvents = "none";
                    //check if proposal passed
                    if (result[6] == 1) {
                        document.getElementById("updown" + i).innerHTML += "<img src='../dist/img/arrowup.png' title='Proposal passed' height='40' width='43'>";
                        //check how many votes it received
                    } else {
                        document.getElementById("updown" + i).innerHTML += "<img src='../dist/img/arrowdown.png' title='Proposal didn't pass' height='40' width='43'>";
                    }


                    var results = result[9];

                    results = results.replace(/'/g, "\"");
                    var myObj = JSON.parse(results);
                    var votes = myObj.votes;

                    document.getElementById("yesno" + i).innerHTML = votes;
                    document.getElementById("voteup" + i).style.opacity = "0.1";
                    document.getElementById("votedown" + i).style.opacity = "0.1";
                    document.getElementById("urlvup" + i).style.pointerEvents = "none";
                    document.getElementById("urlvdown" + i).style.pointerEvents = "none";
                }
            }
        } else {
            htmlString = "<BR>   No proposals yet <BR>";

            $("#proposal-table").append(htmlString);
        }
    }, 3);
}


/**
 * It will show small notification window with passed message
 * 
 * @method showTimeNotification 
 * 
*/

function showTimeNotification(from, align, text) {

    var type = ['', 'info', 'success', 'warning', 'danger', 'rose', 'primary'];

    var color = Math.floor((Math.random() * 6) + 1);

    $.notify({
        icon: "notifications",
        message: text

    }, {
            type: type[color],
            timer: 30000,
            z_index: 10031,
            placement: {
                from: from,
                align: align
            }
        });
}


/**
 * It will enable and disable menu based on the credentials
 * and delegation satus
 * 
 * @method enableMenu 
 * 
*/

function enableMenu() {

    if (currAccount != "") {

        $("#buy-tokens").show();

        $("#sign-out").show();

        if (getCookie("admin") == "1") {
            $("#menu-admin").show();

        }

        if (getCookie("delegated") == "1") {
            $("#cancel-delegation-menu").show();
            $("#delegate-votes-menu").hide();
        }
    }
    else { $("#sidebar-menu").hide(); }
}



/**
 * It will return decoded uri based on the url
 * 
 * @method getParameterByName 
 * @param name
 * @param url
 * @return decoded uri 
 * 
*/

function getParameterByName(name, url) {

    if (!url) { url = window.location.href; }
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) { return null; }
    if (!results[2]) { return ''; }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}



/**
 * It will return decoded uri based on the url
 * 
 * @method getCookie 
 * @param cname
 * @return cookie value
 * 
*/

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


/**
 * It will read contract and display usr balances.
 * 
 * @method checkBalance 
 * 
*/

function checkBalance() {

    //   $.get("https://min-api.cryptocompare.com/data/price?fsym=ETH&tsyms=USD",
    //      function (data, status) {
    //        if (status == "success") {
    //  var myObj = JSON.parse(data);
    // var length = Object(myObj).length;

    //     exchangeFIAT = data.USD;

    exchangeFIAT = 9.88;

    if (currAccount != "") {
        accountBalance = web3.fromWei(web3.eth.getBalance(currAccount), "ether");
        tokenBalance = token.balanceOf(currAccount);
        votingPower = ldHandle.voteWeight(currAccount);
        totalTokens = ldHandle.tokensInCirculation();
        valueIinFIAT = exchangeFIAT * accountBalance;
        if (totalTokens == 0) ownedPercentage = 0
        else
            ownedPercentage = tokenBalance * 100 / totalTokens;

        $("#user-name").prepend(getCookie("firstName") + " " + getCookie("lastName"));

        if (accountBalance == 0) {
            $("#noticeModal").modal();
            $("#sidebar-menu").hide();
            $("#your-balance").hide();
        } else {
            $("#balance-ether").hide();       
            $("#menu-balance-ether").append((accountBalance * 1).formatMoney(2, '.', ',') + " Eth/" + (valueIinFIAT * 1).formatMoney(2, '.', ',') + " USD");
            $("#menu-balance-ether").show();
            $("#your-balance").show();
        }

        if (tokenBalance == 0) {           
            $("#noticeModal").modal();
            $("#alert-warning").show();
            $("#sidebar-menu").hide();
        } else {        
            $("#menu-voting-power").append("<span title='Your voting power'>" + formatNumber(votingPower));
            $("#menu-voting-power").show();      
            $("#menu-balance-tokens").append("<span title='Amount of tokens you own and your percentage. '>" + formatNumber(tokenBalance) + "/" + Math.round(ownedPercentage * 100) / 100 + "%</span>");
            $("#menu-balance-tokens").show();
            $("#your-balance").show();
        }
    }
    else $("#sidebar-menu").hide();
    renderPage();  
}



/**
 * This function adds fake ether for testing
 * 
 * @method fundAccount 
 * 
*/


function fundAccount() {


    var message = confirm("Are you sure you want to add some Ether for free to your account?")
    if (message) {

        $("#alert-success-span").text("Sending money to you. Should be there shortly... :) Refresh page in a few minutes. ");
        $("#alert-success").show();


        web3.eth.sendTransaction({
            from: adminAccount,
            to: currAccount,
            value: web3.toWei(10000, "ether")
        });

    }


}


/**
 * This function will create new member. 
 * It connects to node.js if in stand alone mode
 * to create encrypted key to be read by geth.
 * store key file is writeen in geth storeky location
 * 
 * @method createNewMember 
 * 
*/


function createNewMember() {

    var target,
        targetElement,
        password,
        firstName,
        lastName,
        userID,
        memberHash,
        emailAddress,
        memberPosition;

    emailAddress = document.getElementById("email-address").value;



    memberPosition = ldHandle.getMemberByUserID(emailAddress);

    // if (memberPosition.c[0] >= 0 && memberPosition.s == 1) {

    if (memberPosition >= 0) {



        $("#message-status-title").text("");
        message = "This email has been already taken."
        progressActionsAfter(message, false);
        $("#progress").modal();



    }
    else {

        firstName = document.getElementById("first-name").value;
        lastName = document.getElementById("last-name").value;
        password = document.getElementById("inputPassword").value;

        document.cookie = "firstName=" + firstName;
        document.cookie = "lastName=" + lastName;
        document.cookie = "emailAddress=" + emailAddress;
        document.cookie = "delegated=" + "0";
        document.cookie = "admin=" + "0";

        $("#modal-register").modal("hide");
        progressActionsBefore();

        // Case of creating admin account
        if (emailAddress == "admin@admin.com") {
            var account = adminAccount;
            document.cookie = "account=" + account;

            setTimeout(function () {
                memberHash = web3.sha3(emailAddress + password);
                var referral = account;

                try {
                    ldHandle.newMember(account, true, firstName, lastName, emailAddress, memberHash, defulatTokenAmount, referral, { from: adminAccount, gasprice: gasPrice, gas: gasAmount });
                }
                catch (err) {
                    displayExecutionError(error);
                    return;
                }

                watchNewMembership();
            }, 3);
        }

        //we need to generate new key for new member. 
        else {



            var xhttp = new XMLHttpRequest();

            xhttp.onreadystatechange = function () {
                if (this.readyState == 4 && this.status == 200) {

                    var account = "0x" + this.responseText;
                    $("#message-status-body").text("Your Ethereum address is: " + account);
                    document.cookie = "account=" + account;

                    web3.eth.sendTransaction({
                        from: adminAccount,
                        to: account,
                        value: web3.toWei(1, "ether")
                    });

                    setTimeout(function () {
                        memberHash = web3.sha3(emailAddress + password);
                        var referral = getCookie("ref");

                        if (referral == "undefined") referral = adminAccount;

                        try {
                            memberHandle.newMember(account, true, firstName, lastName, emailAddress, memberHash, defulatTokenAmount, referral, { from: adminAccount, gasprice: gasPrice, gas: gasAmount });
                        }
                        catch (err) {
                            displayExecutionError(err);
                            return;
                        }

                        watchNewMembership();
                    }, 3);
                }
            };
            var parms = "password=" + password;
            xhttp.open("POST", nodejsUrl, true);
            xhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
            xhttp.send(parms);
        }
    }
}



/**
 * This function will watch for events from blochchain and report new member created. 
 * 
 * @method watchNewMembership 
 * 
*/

function watchNewMembership() {


    var logAccount, message, refAddress;
    
    logAccount = ldHandle.MembershipChanged({ member: userAccount }, { canVote: canVote }, { firstName: firstName }, { lastName: lastName }, { userID: userID }, { referralAddress: refAddress });

    // Wait for the events to be loaded
    logAccount.watch(function (error, res) {

        if (res.args.userID == getCookie("emailAddress")) {

            message = '<B><BR>Account successfully created...' + '  <BR><B>First Name:</B>' + res.args.firstName + '<BR><B>Last Name:</B>' + res.args.lastName + '<BR><B>user ID:</B>'
                + res.args.userID + '<BR><B>Can vote:</B>' + res.args.isMember + '<BR><BR>Referral Addres:' + res.args.memberReferral + "<BR>" +
                "We have added " + defulatTokenAmount + " tokens to your account just for signing up. " +
                '<div class="footer text-center">' +
                '<a id="modal-action"  href=" ' + linkAfterSignup + '" class="btn btn-primary btn-round">Continue ..</a>' +
                '</div>';

            progressActionsAfter(message, true);
        } else {
            message = '<B><BR>Account note created due to duplicate user id or other network issues. Try again....';
            progressActionsAfter(message, false);
            clearCookies();
        }
    });

}


/**
 * This function will take user email address and password
 * and hash it, then retrieve hashed user id and password
 * stored on the blockchain and compare. If they are the
 * same, cookies will be written and user considered logged in,
 * 
 * @method userLogin 
 * 
*/

function userLogin() {




    var password,
        userID,
        memberPosition,
        member,
        firstName,
        lastName,
        memberHash,
        addr,
        delegated,
        userIDFromBlockChain,
        isAdmin;

    clearCookies();
    password = document.getElementById("inputPassword-login").value;
    userID = document.getElementById("email-address-login").value;
    memberPosition = memberHandle.getMemberByUserID(userID);

    if (memberPosition >= 0) {
        member = memberHandle.members(memberPosition);
        firstName = member[3];
        lastName = member[4];
        memberHash = member[7];
        addr = member[0];
        delegated = member[6] ? 1 : 0;
        userIDFromBlockChain = member[5];
        isAdmin = member[8] ? 1 : 0;
        canVote = member[1] ? 1 : 0;




        if (memberHash === web3.sha3(userID + password) && userID === userIDFromBlockChain) {
            document.cookie = "firstName=" + firstName;
            document.cookie = "lastName=" + lastName;
            document.cookie = "emailAddress=" + userID;
            document.cookie = "account=" + addr;
            document.cookie = "delegated=" + delegated;
            document.cookie = "admin=" + isAdmin;
            document.cookie = "canvote=" + canVote;
            // location.replace('index.html');
            $("#alert-success-span").text(" Welcome " + firstName + " " + lastName);
            $("#alert-success").show();
            //$("#dashboard").append(" for " + " (" + getCookie("emailAddress") + ")");
            location.replace('');
            // enableMenuAll();
        } else {
            showTimeNotification('top', 'right', "Problem with your credentials. Your password user combination might be wrong.")

        }


    } else {
        showTimeNotification('top', 'right', "Problem with your credentials. This members doesn't exist.")
        $("#alert-warning-span").text(" Problem with your credentials. This members doesn't exist.");
    }

    $("#modal-login").modal("hide");
}



/**
 * This function will remove current cookies
 * 
 * @method clearCookies 
 * 
*/

function clearCookies() {

    var cookies = document.cookie.split(";");

    for (var i = 0; i < cookies.length; i++) {
        var cookie = cookies[i];
        var eqPos = cookie.indexOf("=");
        var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT";
    }

}


/**
 * This function will create new proposal.
 * 
 * @method newProposal 
 * 
*/

function newProposal() {

    var description, title, etherAmount, beneficiary, proposalID;

    if (!handlePassword("modal-idea-proposal", 4)) return;

    var newProposaDescription = $("#new-proposal-description-idea").val();
    var newProposalTitle = $("#new-proposal-title-idea").val();

    try {
        ldHandle.newProposal("", 0, newProposaDescription, newProposalTitle, "", { from: currAccount, gasprice: gasPrice, gas: gasAmount });
    }
    catch (err) {
        displayExecutionError(err);
        return;
    }

    progressActionsBefore();

    setTimeout(function () {

        var logProposals = ldHandle.ProposalAdded({ proposalId: proposalID }, { beneficiary: beneficiary }, { etherAmount: etherAmount }, { description: description }, { title: title });
        logProposals.watch(function (error, res) {

            var message;
            message = '<B>Proposal successfully added...<BR>Title:' + res.args.title + '<BR>Description:</B>' + res.args.description;
            progressActionsAfter(message, true);

        });
    }, 3);
}


/**
 * This function will display errors in popup when called
 * 
 * @method displayExecutionError 
 * 
*/
function displayExecutionError(err) {


    showTimeNotification('top', 'right', err)
    setTimeout(function () {      
    }, 2000);
   
}



/**
 * This function will buy tokens
 * 
 * @method buyTokens 
 * 
*/

function buyTokens() {

    if (!handlePassword("buy-tokens-modal", 2)) return;



    var tokenAmount = $("#token-amount").val();

    singleTokenCost = ldHandle.singleTokenCost();



    var totalTokenCost = singleTokenCost * tokenAmount;
    var userBalance = web3.fromWei(web3.eth.getBalance(currAccount), "wei");

    var maxTokenToBuy = userBalance / singleTokenCost;


    if (totalTokenCost >= userBalance) {

        alert("You don't have enough funds in your account to buy this amount of tokens. You can buy max " + maxTokenToBuy + " of tokens.");
    } else {




        try {
            ldHandle.buyTokens(tokenAmount, { from: currAccount, gasprice: gasPrice, gas: gasAmount, value: totalTokenCost });
        }
        catch (err) {
            displayExecutionError(err);
            return;
        }

        progressActionsBefore();

        setTimeout(function () {

            var logEvent = ldHandle.BuyTokens({ numOfTokens: numOfTokens, buyer: buyer, value: amountSpent });
            logEvent.watch(function (error, res) {

                //  if (tokenAmount == res.args.numOfTokens ) {

                var message = '<B><BR>	You bought ' + res.args.numOfTokens + ' tokens and you have spent ' + res.args.value / 1000000000000000000 + " Eth";
                progressActionsAfter(message, true);
                //   }

            });
        }, 3);
    }

}





/**
 * This function will vote on proposal 
 * 
 * @method voteProposal 
 * 
*/

function voteProposal() {

    var proposalNumber,
        voteYes;

    if (!handlePassword("areYouSure", 1)) return;

    proposalNumber = document.getElementById("parm1").value;
    voteYes = document.getElementById("parm2").value === "true" ? true : false;


    //$("#areYouSure").modal("hide");
    progressActionsBefore();

    setTimeout(function () {

        ldHandle.vote(proposalNumber, voteYes, { from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logVote;
        logVote = ldHandle.Voted({ proposalNumber: proposalNumber }, { supportsProposal: supportsProposal }, { adminAccount: userAccount });

        logVote.watch(function (error, res) {
            var message = "Vote successfully executed...";
            progressActionsAfter(message, true);
        });
    }, 3);



}



/**
 * This function will tally proposal 
 * 
 * @method voteProposal 
 * 
*/

function executeProposal() {




    if (!handlePassword("areYouSure", 1)) return;
    var proposalNumber = document.getElementById("parm1").value;

    var extendedValue = ldHandle.calculateVotes(proposalNumber, { from: adminAccount });

    var myObj = getExtendedProposalResults(extendedValue);

    if (Number(myObj.quorum) < Number(ldHandle.minimumQuorum())) {

        alert("The proposal can't be executed because there is no quorum.")
        return;
    }

    progressActionsBefore();

    setTimeout(function () {

        ldHandle.executeProposal(proposalNumber, 1, 1, "", { from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logProposalExec = ldHandle.ProposalTallied({ proposalId: proposalID }, { yea: yea }, { nay: nay }, { quorum: quorum }, { proposalPassed: proposalPassed });

        logProposalExec.watch(function (error, res) {

            var message;

            if (!res.args.proposalExecuted == 2) {
                message = '<BR><B>Proposal didn\'t pass either due to insufficient quorum or too many voters against it.<B>';
                progressActionsAfter(message, true);
            } else {
                message = '<BR><B>Proposal successfully tallied and passed.<B>';

                progressActionsAfter(message, true);
            }
        });
    }, 3);
}



/**
 * This function will reset delegations by member
 * cancelling previous delegation and returning
 * all voting power to the member
 * 
 * @method resetDelegation 
 * 
*/

function resetDelegation() {

    if (!handlePassword("areYouSure", 1)) return;

    progressActionsBefore();

    setTimeout(function () {

        ldHandle.resetDelegation({ from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logResetingDelegation = ldHandle.DelegationReset({ status: status });

        logResetingDelegation.watch(function (error, res) {
            message = "<B>Delegation has been reset.<BR>";
            progressActionsAfter(message, true);
            document.cookie = "delegated=" + "0";
        });
    }, 3);
}



/**
 * This function will cancel all delegations by admin
 * bringing original arrangement
 * 
 * @method cancelDelegation 
 * 
*/

function cancelDelegation() {


    if (!handlePassword("areYouSure", 1)) return;

    progressActionsBefore();

    setTimeout(function () {

        ldHandle.removeDelegation(currAccount, 0, true, { from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logRemoveDelegation = ldHandle.CancelDelegation({ nominee: nominatedAddress });

        logRemoveDelegation.watch(function (error, res) {
            message = "<B>Delegation has been cancelled.<BR>";
            progressActionsAfter(message, true);
            document.cookie = "delegated=" + "0";
        });
    }, 10);
}




/**
 * This function will change status of member voting rights
 * 
 * @method blockUnblock 
 * 
*/

function blockUnblock() {


    if (!handlePassword("areYouSure", 1)) return;

    var banUnbanAddress = $("#parm1").val();
    var canVote = $("#parm2").val();
    canVote = canVote == 1 ? true : false;

    progressActionsBefore();

    setTimeout(function () {

        memberHandle.blockUnblockMember(banUnbanAddress, canVote, { from: currAccount, gasprice: gasPrice, gas: gasAmount });
        var logBanUnban = memberHandle.BlockUnblockMember({ member: userAccount, status: status });

        logBanUnban.watch(function (error, res) {

            var status = canVote ? "Unblocked" : "Blocked";

            var message = "<BR>Member has been " + status + ".<BR>";
            progressActionsAfter(message, true);
        });
    }, 3);


}


/**
 * This function will delegate member votes
 * 
 * @method delegateVote 
 * 
*/

function delegateVote() {

    if (!handlePassword("areYouSure", 1)) return;

    var nominatedAddress = $("#parm1").val();


    progressActionsBefore();
    setTimeout(function () {
        ldHandle.delegate(nominatedAddress, { from: currAccount, gasprice: gasPrice, gas: gasAmount });
        var logDelegation = ldHandle.Delegated({ nominatedAddress: nominatedAddress }, { sender: sender }, { voteIndex: voteIndex });

        logDelegation.watch(function (error, res) {
            var message = "<B>Your vote has been successfully delegated <BR>";
            progressActionsAfter(message, true);
            document.cookie = "delegated=" + "1";
        });
    }, 3);



}



/**
 * This function will transfer onwership to new admin
 * 
 * @method transferOwnership 
 * 
*/

function transferOwnership() {


    if (!handlePassword("areYouSure", 1)) return;

    var newAdminAddress = $("#parm1").val();
    progressActionsBefore();
    setTimeout(function () {

        memberHandle.transferOwnership(newAdminAddress, { from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logMakeAdmin = memberHandle.OwnershipTransfer({ status: status });
        logMakeAdmin.watch(function (error, res) {
            var message = "<B>Admin rights have been transfered to new member. <BR>";
            progressActionsAfter(message, true);
            document.cookie = "admin=0";
        });

    }, 3);

}


/**
 * This function will open window with voting results
 * 
 * @method viewResults 
 * @param proposalNo 
 * 
*/

function viewResults(proposalNo) {

    var proposal;

    setTimeout(function () {

        proposal = ldHandle.proposals(proposalNo, { from: adminAccount });

        var extendedValue = ldHandle.calculateVotes(proposalNo, { from: adminAccount });

        var myObj = getExtendedProposalResults(extendedValue);
        var votes = myObj.votes;

        var numOfVotes = ldHandle.numOfVotes(proposalNo);


        proposalNo = parseInt(proposalNo) + 1;

        var executed, passed;

        if (proposal[6] == 1) {

            executed = "yes";
            passed = 'yes';
        } else if (proposal[6] == 2) {
            executed = "yes";
            passed = 'no';

        } else {
            executed = "no";
            passed = 'no';

        }


        $('#content-to-show').html("<div class='row list-show'><div class='col-xs-5'><B>Proposal Number:</B></div> <div class='col-xs-7'>" + proposalNo + "</div></div>"

            + "<div class='row list-show'><div class='col-xs-5'><B>Title:</B></div><div class='col-xs-7'>" + proposal[3] + "</div></div>"

            + "<div class='row list-show'><div class='col-xs-5'><B>Description:</B></div><div class='col-xs-7'>" + proposal[2] + "</div></div>"
            + "<div class='row list-show'><div class='col-xs-5'><B>Voting Deadline:</B></div><div class='col-xs-7'>" + convertTimestamp(proposal[5]) + "</div></div>"
            + "<div class='row list-show'><div class='col-xs-5'><B>Proposal Executed:</B></div><div class='col-xs-7'>" + executed + "</div></div>"
            + "<div class='row list-show'><div class='col-xs-5'><B>Proposal Passed:</B></div><div class='col-xs-7'>" + passed + "</div></div>"
            + "<div class='row list-show'><div class='col-xs-5'><B>Voters:</B></div><div class='col-xs-7'>" + numOfVotes + "</div></div>"
            + "<div class='row list-show'><div class='col-xs-5'><B>Voting Token Count:</B></div><div class='col-xs-7'>" + myObj.votes + "</div></div>"
            + "<div class='row list-show'><div class='col-xs-5'><B><font color='green'>Votes For: <img  style ='width:20px; height:20px;' src='../dist/img/voteup.png'  align='top'></B></div><div class='col-xs-7' style='display: inline-block; white-space: nowrap; vertical-align: middle;'>" + myObj.yea + "</font></div></div><div class='row list-show'><div class='col-xs-5'><B><font color='red'>Votes Against:<img  style ='width:20px; height:20px;' src='../dist/img/votedown.png' height='20' width='20'></B></div><div  class='col-xs-7' style='display: inline-block; white-space: nowrap; vertical-align: top;'>"
            + myObj.nay + "</font></div></div> <div class='row list-show'><div class='col-xs-5'><B>Participation:</B></div><div class='col-xs-7'>" + myObj.quorum + "%</div></div>");

    }, 3);

}



/**
 * Helper function which parses string
 * into object of the voting results 
 * 
 * @method getExtendedProposalResults 
 * @param results 
 * 
*/


function getExtendedProposalResults(results) {


    results = results.replace(/'/g, "\"");
    var myObj = JSON.parse(results);
    return myObj;

}



/**
 * Function to display voting parms
 * 
 * 
 * @method getExtendedProposalResults 
 * @param results 
 * 
*/

function viewAbout() {



    var account = getCookie("account");

    setTimeout(function () {

        var minimumQuorum, debatingPeriodInMinutes, numProposals, numMembers;

        minimumQuorum = ldHandle.minimumQuorum();
        debatingPeriodInMinutes = ldHandle.debatingPeriodInMinutes();
        numProposals = ldHandle.numProposals();
        numMembers = ldHandle.numMembers();

        var welcome = "Welcome to " + organizationName + "  Voting System ";

        var message = "<div><div><B>Minimum quorum:</B> " + minimumQuorum + "%<BR> <B>Debating periods:</B> " +
            debatingPeriodInMinutes + "(minutes)<BR>---------------------------------------------<BR> <B>Number of proposals:</B> " +
            numProposals + "<BR><B>Number of members:</B> " + numMembers + "</div></div>";

        $("#about-heading").text(welcome);
        $("#about-body").html(message);
        $("#dashboard-members-no").text(numMembers);
        $("#dashboard-proposal-no").text(numProposals);


    }, 3);

}



/**
 * Function to change voting rules
 * 
 * @method changeVotingRules 
 * 
*/

function changeVotingRules() {

    var minimumSharesToPassVote,
        minutesForDebate,
        minMembers;

    if (!handlePassword("modal-change-rules", 3)) return;

    minimumSharesToPassVote = document.getElementById("new-quorum").value;
    minutesForDebate = document.getElementById("debating-period").value;

    progressActionsBefore();

    setTimeout(function () {

        ldHandle.changeVotingRules(minimumSharesToPassVote, minutesForDebate, 1, { from: currAccount, gasprice: gasPrice, gas: gasAmount });

        var logRulesChange = ldHandle.ChangeOfRules({ minimumSharesToPassAVote: minimumSharesToPassAVote }, { minutesForDebate: minutesForDebate });

        logRulesChange.watch(function (error, res) {
            var message = "New rules successfully applied..";
            progressActionsAfter(message, true);
        });
    }, 3);

}



/**
 * Function to handle member password
 * 
 * @method handlePassword
 * @param parentWindow 
 * @param mode 
 * 
*/


function handlePassword(parentWindow, mode) {

    var password;

    try {
        if (mode == 0) password = $("#pass").val();
        else if (mode == 1) password = $("#pass-are-you-sure").val();
        else if (mode == 2) password = $("#pass-tokens").val();
        else if (mode == 3) password = $("#pass-rules-change").val();
        else if (mode == 4) password = $("#pass-proposal").val();

        web3.personal.unlockAccount(currAccount, password, 20);
        $("#modal-password").modal("hide");
        $("#" + parentWindow).modal("hide");
        $("#message-status-body").html("");

        return true;

    }
    catch (err) {
        $("#wrong-password-message").show();
        $("#wrong-password-message-integrated").show();
        $("#wrong-password-message-integrated-sure").show();

        return false;
    }
}



/**
 * Function to logut the member
 * 
 * @method  userLogout
 * 
*/

function userLogout() {

    clearCookies();
 
    $("#alert-success").show();
    $("#dashboard").text("Dashboard");
   
    showTimeNotification('top', 'right', "You have been successfully logged out.")
    setTimeout(function () {
        location.replace('index.html');
    }, 2000);


}




/**
 * Function to show progress indicator before the blockchain action
 * 
 * @method progressActionsAfter
 * @param message
 * @param success 
 * 
*/


function progressActionsAfter(message, success) {

    if (success) {
        $("#message-status-title").html("Contract executed...<img src='../dist/img/checkmark.gif' height='40' width='43'>");
    }
    else {
        $("#message-status-title").html("Contract executed...<img src='../dist/img/no.png' height='40' width='43'>");
    }

    $("#message-status-body").html("<BR>" + message);

}





/**
 * Function to show progress indicator after the blockchain action
 * 
 * @method progressActionsBefore 
 * 
*/

function progressActionsBefore() {


    $("#message-status-title").html("");
    $("#message-status-body").html("");
    $("#progress").modal();
    $("#message-status-title").html('Verifying contract... <i class="fa fa-refresh fa-spin" style="font-size:28px;color:red"></i>');
    setTimeout(function () {
        $("#message-status-title").html('Executing contract..<i class="fa fa-spinner fa-spin" style="font-size:28px;color:green"></i>');
    }, 1000);

}



/**
 * Prototype to format stting as time 
 * 
 * @method toHHMMSS 
 * @return formated string
 * 
 * 
*/


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

    if (hoursInt < 0) { return "CLOSED <BR>for voting" }
    else if (days == 0) {
        return hours + ':' + minutes + ':' + seconds + " Time left";
    }
    else
        return days + " days left";
}


/**
 * Funcion to animaet countdown for the voting
 * 
 * @method countdown 
 * @param elemnt
 * @param timeString
 * @param dealine 
 * 
*/


function countdown(element, timeString, deadline) {
    // Fetch the display element
    var el = document.getElementById(element);


    // Set the timer
    var interval = setInterval(function () {

        var nowInseconds = Date.now() / 1000;
        var timeLeft = (deadline - nowInseconds).toString().toHHMMSS();
        el.innerHTML = timeLeft;
        document.getElementById(element).innerHTML = el.innerHTML;

        if (timeLeft == "CLOSED <BR>for voting") {
            clearInterval(interval);
            var countValue = element.substr(11);
            document.getElementById("voteup" + countValue).style.opacity = "0.1";
            document.getElementById("votedown" + countValue).style.opacity = "0.1";
            document.getElementById("urlvup" + countValue).style.pointerEvents = "none";
            document.getElementById("urlvdown" + countValue).style.pointerEvents = "none";
            document.getElementById("sum" + countValue).style.opacity = "1";
            document.getElementById("urlsum" + countValue).style.pointerEvents = "index.html?mode=s&pn=" + countValue;
        }
    }, 1000);
}


/**
 * Prototype to format number as money
 * 
 * @method formatMoney 
 * @return formated string
 * 
*/

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



/**
 * Funcion to convert Unix timestamp to date and time
 * 
 * @method convertTimestamp 
 * @param timestamp
 * @return formated string 
 * 
*/


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




/**
 * Funcion to number with comas and dots
 * 
 * @method formatNumber 
 * @param number
 * @return formated string
 * 
*/

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


/**
 * Funcion to number with comas and dots
 * 
 * @method convertDateToTimeStamp 
 * @param dateString
 * @param Unix timestamp
 * 
*/

function convertDateToTimeStamp(dateString) {

    var dateTimeParts = dateString.split(' '),
        timeParts = dateTimeParts[1].split(':'),
        dateParts = dateTimeParts[0].split('/'),
        date;


    date = new Date(dateParts[2], parseInt(dateParts[1], 10) - 1, dateParts[0], timeParts[0], timeParts[1]);
    return date.getTime() / 1000;


}



function setFormValidation(id) {
    $(id).validate({
        errorPlacement: function (error, element) {
            $(element).parent('div').addClass('has-error');
        }
    });
}


$(document).on('submit', '.validateDontSubmit', function (e) {
    //prevent the form from doing a submit
    e.preventDefault();
    return false;
});


$(document).on('submit', '#submit-proposal', function (e) {
    if (e.isDefaultPrevented()) {
        // handle the invalid form...
    } else {
        e.preventDefault();       
    }
});

// execute creation of new member
$(document).on('submit', '#register-form', '#register-form-initial', function (e) {
    if (e.isDefaultPrevented()) {
        // handle the invalid form...
    } else {
        e.preventDefault();
    }
    createNewMember();
});

// execute creation of new member
$(document).on('submit', '#register-form-initial', function (e) {
    if (e.isDefaultPrevented()) {
        // handle the invalid form...
    } else {
        e.preventDefault();
    }
    createNewMember();
});



// execute login
$(document).on('submit', '#login-form', function (e) {
    if (e.isDefaultPrevented()) {
        userLogin();
        // handle the invalid form...
    } else {
        e.preventDefault();
        userLogin();

    }
});



// trigger function to fund account from alret waring mesage
$(document).on('click', '#fund-account-message', '#fund-account', function (e) {
    fundAccount();
});



// handle link to delegate votes to different member. 
$(document).on('click', '.linkDelegateClass', function (e) {

    e.preventDefault();
    var value = $(this).attr("href");

    var memberPosition = memberHandle.getMemberByUserID(getCookie("emailAddress"));
    var member = memberHandle.members(memberPosition);

    if (!member[1]) {
        $("#modal-message").html("You can't delegate your vote because your account is blocked from voting.");
        $("#noticeModal").modal();
        return;
    }

    var delegatedMemberEmail = decodeURI(getParameterByName('ui', value));

    memberPosition = memberHandle.getMemberByUserID(delegatedMemberEmail);
    member = memberHandle.members(memberPosition);

    if (!member[1]) {
        $("#modal-message").html("You can't delegate your vote to this member because his/her account is blocked from voting.");
        $("#noticeModal").modal();
        return;
    }


    actionButton = document.getElementById("modal-action-areyousure");
    actionButton.addEventListener('click', delegateVote);


    var nominatedAddress = decodeURI(getParameterByName('mi', value));
    var actionName = decodeURI(getParameterByName('flname', value));

    $("#parm1").val(nominatedAddress);

    $("#sure-mesasge").text("Are you sure you want to delegate your vote to " + actionName + "?");

    $("#modal-action-areyousure").text("Delegate")
    $("#are-you-sure-title").text("Delegating votes")


    $("#pass-are-you-sure").val("");
    $("#areYouSure").modal();
});

// handle link to ban or unban the user 

$(document).on('click', '.linkbanClass', function (e) {

    e.preventDefault();

    actionButton = document.getElementById("modal-action-areyousure");
    actionButton.addEventListener('click', blockUnblock);

    var value = $(this).attr("href");
    var actionAddress = decodeURI(getParameterByName('mi', value));
    var action = decodeURI(getParameterByName('mode', value));
    var actionName = decodeURI(getParameterByName('flname', value));

    $("#parm1").val(actionAddress);
    var action = decodeURI(getParameterByName('mode', value));
    $("#parm1").val(actionAddress);
    $("#parm2").val(action);

    $("#sure-mesasge").text("Are you sure you want to ban " + actionName + "?");

    $("#modal-action-areyousure").text("Ban/Unban")
    $("#are-you-sure-title").text("Banning/Unbanning member")

    $("#pass-are-you-sure").val("");
    $("#areYouSure").modal();
});

// handle link to view proposals details 
$(document).on('click', '.linkProposalViewClass', function (e) {



    e.preventDefault();
    var value = $(this).attr("href");
    var proposalNo = decodeURI(getParameterByName('pn', value));
    $("#content-header").html("<span class='glyphicon glyphicon-info-sign'></span> Proposal info")
    $("#show-content").modal();

    // $("#show-content").on('shown.bs.modal', function () {


    viewResults(proposalNo);
    //});
});





//handle link to tally proposals 

$(document).on('click', '.linkTallyClass', function (e) {

    e.preventDefault();
    var value = $(this).attr("href");

    actionButton = document.getElementById("modal-action-areyousure");
    actionButton.addEventListener('click', executeProposal);
    var proposalNo = decodeURI(getParameterByName('pn', value));

    $("#parm1").val(proposalNo);

    proposalNo++;

    $("#sure-mesasge").text("Are you sure you want to tally  proposal No: " + proposalNo + "?");

    $("#modal-action-areyousure").text("Tally")
    $("#are-you-sure-title").text("Tally proposal");

    $("#pass-are-you-sure").val("");
    $("#areYouSure").modal();
});



// handel link to vote on proposals 

$(document).on('click', '.linkVoteClass', function (e) {

    e.preventDefault();

    var value = $(this).attr("href");
    actionButton = document.getElementById("modal-action-areyousure");
    actionButton.addEventListener('click', voteProposal);
    var proposalNo = decodeURI(getParameterByName('pn', value));
    var yesNo = decodeURI(getParameterByName('up', value));

    $("#parm1").val(proposalNo);
    $("#parm2").val(yesNo);

    proposalNo++;

    if (yesNo == "true") {
        $("#sure-mesasge").text("Are you sure you want to vote for proposal No: " + proposalNo + "?");
        $("#are-you-sure-title").text("Voting for proposal");
    }
    else {
        $("#sure-mesasge").text("Are you sure you want to vote against proposal No: " + proposalNo + "?");
        $("#are-you-sure-title").text("Voting against proposal");
    }

    $("#modal-action-areyousure").text("Vote");

    $("#pass-are-you-sure").val("");
    $("#areYouSure").modal();

});



// Open change rules window
$("#change-token-parms").click(function () {
    $("#change-token-parms-form")[0].reset();
    $("#modal-change-token-parms").modal();

});




//handle submitting new parms for tokens window
$("#modal-action-new-token-parms").click(function () {


    actionButton = document.getElementById("modal-action-password");
    actionButton.addEventListener('click', changeTokenParms);
    $("#password-box-form")[0].reset();
    $("#modal-password").modal();

});

// handel link to pass admin 

$(document).on('click', '.linkAdminClass', function (e) {

    e.preventDefault();

    var value = $(this).attr("href");
    actionButton = document.getElementById("modal-action-areyousure");
    actionButton.addEventListener('click', transferOwnership);
    var newAdmin = decodeURI(getParameterByName('mi', value));
    var actionName = decodeURI(getParameterByName('flname', value));


    $("#parm1").val(newAdmin);
    var newAdmin = decodeURI(getParameterByName('mi', value));
    $("#sure-mesasge").text("Are you sure you want to pass admin rights to  " + actionName + "?");
    $("#modal-action-areyousure").text("Transfer Onwership")
    $("#pass-are-you-sure").val("");
    $("#areYouSure").modal();

});


// switch arrows on the collapsible control

$(document).on('click', 'a[data-toggle=collapse]', function (e) {
    var urlClicked = e.currentTarget.hash;
    var id = urlClicked.substr(9);

    var status = $("#arrow" + id).css("transform");

    if (status == "matrix(1, 0, 0, 1, 0, 0)") $("#arrow" + id).css("transform", "rotate(270deg)");
    else $("#arrow" + id).css("transform", "rotate(0deg)");
});




$(document).ready(function () {
  

    setFormValidation('#login-form');
    setFormValidation('#register-form');
    setFormValidation('#buy-tokens');
    setFormValidation('#submit-proposal');  
    setFormValidation('#register-form-initial');


    $('.datetimepicker').datetimepicker({
        format: 'DD/MM/YYYY HH:MM',
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove'
        }
    });

    $('.datepicker').datetimepicker({
        format: 'MM/DD/YYYY',
        icons: {
            time: "fa fa-clock-o",
            date: "fa fa-calendar",
            up: "fa fa-chevron-up",
            down: "fa fa-chevron-down",
            previous: 'fa fa-chevron-left',
            next: 'fa fa-chevron-right',
            today: 'fa fa-screenshot',
            clear: 'fa fa-trash',
            close: 'fa fa-remove',
            inline: true
        }
    });


    $("time.timeago").timeago();



    // Remove custom error message from password box when user starts typing again .
    $("#pass").mousedown(function () {
        $("#wrong-password-message").hide();
    });

    // Remove custom error message from password box in the integrated window when user starts typing again .
    $("#pass-are-you-sure").keydown(function () {
        $("#wrong-password-message-integrated").hide();
    });


    // trigger function to add some ether to first time users. 
    $("#fund-account").click(function () {

        fundAccount();

    });


    // Opern new proposal window
    $("#start-idea-proposal").click(function () {

        actionButton = document.getElementById("modal-action-areyousure");
        actionButton.addEventListener('click', newProposal);

        $("#new-proposal-title-idea").val("");
        $("#new-proposal-description-idea").val("");
        $("#modal-idea-proposal").modal();

    });


    // Open change rules window
    $("#change-rules-stats").click(function () {
        $("#modal-change-rules").modal();

    });

    // Notify users that any of this actions is not implemented yet. 
    $("#transfer-tokens, #sell-tokens, #mine-tokens, #start-new-debate, #current-debates, #live-projects, #funded-projects, #completed-projects").click(function () {
        alert("Feature not impleneted yet. ");

    });


    //handle opening rules change window
    $("#modal-action-new-rules").click(function () {       
        changeVotingRules();

    });



    //Handle opening new idea proposal window
    $("#modal-action-new-proposal").click(function () {

        var form = $("#new-proposal-title-idea");
        form.validate();

        if (form.valid()) newProposal();

    });


    //handel opening of buy token window
    $("#buy-tokens, #buy-tokens-message").click(function () {

        actionButton = document.getElementById("modal-action-buy-tokens");
        actionButton.addEventListener('click', buyTokens);
        $("#pass-tokens").val("");
        $("#buy-tokens-modal").modal();
    });

    // open dialog box for reseting delgations

    $("#reset-delegation").click(function () {

        actionButton = document.getElementById("modal-action-areyousure");
        actionButton.addEventListener('click', resetDelegation);

        $("#sure-mesasge").text("This action will erase all delegations made by members and members will need to execute their delegations again, are you sure?");
        $("#modal-action-areyousure").text("Reset delegation")
        $("#are-you-sure-title").text("Reseting delegation")
        $("#pass-are-you-sure").val("");
        $("#areYouSure").modal();

    });

    // open dialog box for withdrawing delgations

    $("#withdraw-delegation").click(function () {

        actionButton = document.getElementById("modal-action-areyousure");
        actionButton.addEventListener('click', cancelDelegation);

        $("#sure-mesasge").text("This action will cancel your prior delegation of your voting rights, are you sure?");
        $("#are-you-sure-title").text("Withdrawing delegation")
        $("#modal-action-areyousure").text("Cancel delegation")
        $("#pass-are-you-sure").val("");
        $("#areYouSure").modal();
    });

    // open list with all proposals
    $("#view-new-proposal, #vote-new-proposal, #tally-proposals").click(function () {
        $("#list-body").html("Loading ...... <img src='../dist/img/progress.gif' height='40' width='43'>");
        $("#modal-proposal-list").modal();
        listProposals();

    });

    // open list with all members for delegation
    $("#delegate-votes-menu").click(function () {
        $("#list-body").html("Loading ...... <img src='../dist/img/progress.gif' height='40' width='43'>");
        $("#modal-proposal-list").modal();     
        listMembers("delegate");
    });

    // open list with all members to ban unban member
    $("#ban-member").click(function () {
        $("#list-body").html("Loading ...... <img src='../dist/img/progress.gif' height='40' width='43'>");
        $("#modal-proposal-list").modal();       
        listMembers("ban");
       
    });


    // open list with all members for admin transfer
    $("#transfer-owner").click(function () {

        $("#list-body").html("Loading ...... <img src='../dist/img/progress.gif' height='40' width='43'>");
        $("#modal-proposal-list").modal();      
        listMembers("transferadmin");       
    });


    // hide wrong password message on integrated window when it closes
    $("#areYouSure").on('hidden.bs.modal', function () {
        $("#wrong-password-message-integrated").hide();
    });

    // hide wrong password message on regular password window when it closes
    $("#modal-password").on('hidden.bs.modal', function () {
        $("#wrong-password-message").hide();
    });


    // open login window
    $("#menu-login").click(function () {     
        $("#modal-login").modal();     
    });

    // open signup window
    $("#menu-signup").click(function () {

        $("#register-form")[0].reset();
        $("#modal-register").modal();
    });


    // trigger logout
    $("#menu-logout").click(function () {

        userLogout();
    });


   
    var $validator = $("#commentForm").validate({

    });

});









