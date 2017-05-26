import "./SafeMath.sol";
import "./SWARM.sol";
import "./PullPayment.sol";
import "./Pausable.sol";



//Crowdsale Smart Contract for the SWARM project
//This smart contract collects ETH and BTC, and in return sends SWARM tokens to the investors
  


contract Crowdsale is SafeMath, PullPayment, Pausable {

	// to store Investor info
  	struct Investor {
		uint weiReceived;		// amount of ETH contributed
		string BTCaddress;  	// store the btc address for full traceability
		uint satoshiReceived;	// Amount of BTC contributed
		uint SWARMSent;        	// amount of tokens  sent
        address sponsor ;       // address of sponsor
	}

	// to store ambasador referral info
 	struct Sponsor{

        address referral;       	// address of ambasador
		uint weiReferred;	// amount of ETH contributed by referrral
		uint satoshiReferred;	// amount of BTC contributed by referral	
		bool isAmbassador;	// true if ambasador, otherwise affiliate
		uint tokensSent;        // number of tokens sent to the affiliate
	}
	


	SWARM 	public swarm;		// SWARM contract reference
	address public owner;		// Contract owner (swarm.fund team)
	address public multisigETH;	// Multisig contract that will receive the ETH
	address public BTCproxy;	// address of the BTC Proxy
	uint public weiToSatoshi;	// exchange rate between ETH and BTC	
	uint public ETHReceived;	// Number of ETH received
	uint public BTCReceived;	// Number of BTC received
	uint public SWARMSentToETH;	// Number of SWARM sent to ETH contributors
	uint public SWARMSentToBTC;	// Number of SWARM sent to BTC contributors
	uint public SWARMSentToRef;	// Number of SWARM sent to sponsors
	uint public startBlock;		// Crowdsale start block
	uint public endBlock;		// Crowdsale end block
	uint public minCap;		// Minimum number of SWARM to sell 
	uint public maxCap;		// Maximum number of SWARM to sell
	bool public maxCapReached;	// Max cap has been reached
	uint public minInvestETH;	// Minimum amount to invest
	uint public minInvestBTC;	// Minimum amount to invest
	bool public crowdsaleClosed;	// Is crowdsale still on going

	
	address public reserve; 	// address at which the contingency reserve will be sent
	address public team;		// address at which the team SWARM will be sent

	uint public SWARM_reserve;	// amount of the contingency reserve	
	uint public etherInvestors; 	// number of investors who used ether
	uint public bitcoinInvestors; 	// number of investors who used bitcoin
	uint multiplier = 10000000000; 	// to provide 10 decimal values

	mapping(address => Investor) public investors;  //investor list
	mapping(address => Sponsor) public sponsors;	// sponsors list

	mapping(address => address) public ambassadorRegistry;
	mapping(address => address) public affiliateRegistry;

    	/// onlyBy()
	/// @notice to be used when certain account is required to access the function 
    	/// @param a {address}  The address of the authorised individual   
	modifier onlyBy(address a){
		if (msg.sender != a) throw;  
		_;
	}

	/// minCapNotReached
	/// @notice to verify if deadline has passed and minimum cap hasn't been reacched        
	modifier minCapNotReached() {
		if ((now<endBlock) || SWARMSentToETH + SWARMSentToBTC >= minCap ) throw;
		_;
	}

	/// respectTimeFrame
	/// @notice to verify if action is not performed out of the campaing range    
	modifier respectTimeFrame() {
		if ((now < startBlock) || (now > endBlock )) throw;
		_;
	}

	/*
	* Events
	*/
	event ReceivedETH(address investor, uint amount, uint tokenAmount);
	event ReceivedBTC(address investor, string from, uint amount, string txid, uint tokenAmount);
	event RefundBTC(string to, uint value);
	event ReferralProcessed(address member, address referral, uint amount, uint256 btcOrEth, bool ambasador, uint tokensEarned);
	

	/// Crowdsale  {constructor}
	/// @notice fired when contract is crated. Initilizes all constnat variables.     
	function Crowdsale(SWARM SWARMaddress) {


		owner = msg.sender;
		BTCproxy = 0xa972ed74b34aE1D99713349c997f558f9B50C8D1;
		//swarm = SWARM(0xfb0CAa5A324E5a878c8bC98CE1430976992A964c);
		swarm = SWARMaddress;
		multisigETH = 0x0000000000000000000000000000000000;
		team = 0x0000000000000000000000000000000000;
		reserve = 0x0000000000000000000000000000000000;		
		SWARMSentToETH = 0;        
		SWARMSentToBTC = 0;
		SWARMSentToRef = 0;
		minInvestETH = 1 ether;
		minInvestBTC = 5000000;		// approx 50 USD or 0.05000000 BTC
		startBlock = 0 ;		// should wait for the call of the function start
		endBlock =  0;  		// should wait for the call of the function start
		weiToSatoshi = 143287209000;	// will be update every 10min based on the exchnage value externally
		minCap=12000000 * multiplier;	    
		maxCap=20000000 * multiplier;		
		SWARM_reserve=170000 * multiplier;	// max 6000000 SWARM to be discussed			
	}


	function registerSponsor(address member, address sponsor, bool isAmbassador) public onlyBy(owner) returns (bool){
		if (isAmbassador) ambassadorRegistry[member] = sponsor;
		else affiliateRegistry[member] = sponsor;
		return true;
    	}

    

	/// {fallback function}  
	/// @notice It will call internal function which handels allocation of Ether and calculates SWARM tokens.   
	function() payable {
		if (now > endBlock) throw;
		handleETH(msg.sender);
	}

        // for testing only
    	function payThroghRef() payable returns (bool){
        	if (now > endBlock) throw;
		     handleETH(msg.sender);
        
   	 }
    
	
	
	/// start 
	/// @notice It will be called by owner to start the sale  
	function start() onlyBy(owner) {
		startBlock = now ;            
		endBlock =  now + 30 days;    
	}

    

    

	/// handleETH 
	/// @notice It will be called by fallback function whenever ether is sent to it
	/// @param   _investor {address} address of beneficiary
	/// @return res {bool} true if transaction was successful
	function handleETH(address _investor) internal  stopInEmergency  respectTimeFrame returns (bool res) {
 		if (msg.value < minInvestETH) throw;			/ stop when required minimum is not sent

        	var (sponsor, isAmbassador)  = determineSponsor(_investor);
	
        	uint SWARMToSend = computeTokensToSend(safeDiv(msg.value, weiToSatoshi)) ; 	// compute the number of SWARM to send based on converted ETH to BTC

        	if (sponsor != 0x0 && !isAmbassador) {
             		uint referralTokenToSend = safeDiv( safeMul(SWARMToSend, 2 ) , 100); // add 2% bonus for using referral link
             		SWARMToSend = safeAdd(SWARMToSend, referralTokenToSend );
        	}

        	if (safeAdd(SWARMToSend, safeAdd(SWARMSentToRef, safeAdd(SWARMSentToETH, SWARMSentToBTC))) > maxCap)  // ensure that max cap hasn't been reached
			throw;
		

		Investor investor = investors[_investor];
        
        
		if (!swarm.transfer(_investor, SWARMToSend)) throw;			// transfer SWARM tokens        				 
		investor.SWARMSent = safeAdd(investor.SWARMSent, SWARMToSend);
		investor.weiReceived = safeAdd(investor.weiReceived, msg.value);                             
		ETHReceived = safeAdd(ETHReceived, msg.value);				// Update the total Ether recived
		SWARMSentToETH = safeAdd(SWARMSentToETH, SWARMToSend);
		etherInvestors ++;							// keep count of investors       

        	if (sponsor != 0x0){
            		handleReferral( sponsor, _investor, msg.value, 1, isAmbassador, SWARMToSend);
        	if (investor.sponsor == 0x0 ) investor.sponsor = sponsor;	// update sponsor recrod only once  
       		}
        
		
		ReceivedETH(_investor,msg.value, SWARMToSend );									    // register event
		return true;	
	}
	

	/// handleBTC 
	/// @notice It will record contribution in BTC called by proxy
	/// @param _investor {address} address of beneficiary
	/// @param _addressBTC {string} address of BTC funds sender
	/// @param _amount {uint} amount of BTC sent
	/// @param _transactionID {string} BTC
	/// @return res {bool} true if transaction was successful	
        function handelBTC(address _investor, string _addressBTC, uint _amount, string _transactionID) stopInEmergency respectTimeFrame onlyBy(BTCproxy) returns (bool res){
		if (_amount < minInvestBTC) throw;												// verification also made on BTC proxy side
        
        
        	var (sponsor, isAmbassador)  = determineSponsor(_investor);
		uint SWARMToSend = computeTokensToSend(_amount);									// compute the number of SWARM to send based on converted BTC amount

        	if (sponsor != 0x0 && ! isAmbassador) {
             	uint referralTokenToSend = safeDiv( safeMul(SWARMToSend    , 2 ) , 100); 
             	SWARMToSend = safeAdd(SWARMToSend, referralTokenToSend );
        	}

		if (safeAdd(SWARMToSend, safeAdd(SWARMSentToRef ,safeAdd(SWARMSentToETH, SWARMSentToBTC))) > maxCap){  	// ensure that max cap hasn't been reached
			RefundBTC(_addressBTC , _amount);
			return false;
		}

		Investor investor = investors[_investor];
		if (!swarm.transfer(_investor, SWARMToSend)) throw;							// transfer SWARM tokens         

		investor.SWARMSent = safeAdd(investor.SWARMSent , SWARMToSend);
		investor.BTCaddress = _addressBTC;
		investor.satoshiReceived = safeAdd(investor.satoshiReceived, _amount);
		BTCReceived =  safeAdd(BTCReceived, _amount);									// Update the total BTC contributed 
		SWARMSentToBTC = safeAdd(SWARMSentToBTC, SWARMToSend);							// Update the total tokens sent due to BTC contributions 
		bitcoinInvestors ++;															// keep count of investors

        	if (sponsor != 0x0){
            		handleReferral( sponsor, _investor, _amount, 2, isAmbassador, SWARMToSend);
        	if (investor.sponsor == 0x0 ) investor.sponsor = sponsor;
        	}

		ReceivedBTC(_investor, _addressBTC, _amount, _transactionID, SWARMToSend);
		return true;																	// register event
	}
	
	
	function determineSponsor(address _investor) constant returns(address, bool){
	    
		address sponsor;
		bool isAmbassador;
		if (ambassadorRegistry[_investor] != 0x0) {
            		sponsor = ambassadorRegistry[_investor];
            		isAmbassador = true;
		} else if (affiliateRegistry[_investor] != 0x0)
            		sponsor = affiliateRegistry[_investor];
	    
		return (sponsor, isAmbassador);	    
	}

    function handleReferral(address _sponsor, address _referral, uint _amount, uint256 _paymentType, bool _isAmbassador, uint _tokensSent) internal returns (bool){

        // paymentType = 1 ETH sent
        // paymentType = 2 BTC sent
        uint tokensToSend;
        uint totalTokensSold = safeAdd(safeAdd(SWARMSentToETH, SWARMSentToBTC), SWARMSentToRef);

        Sponsor sponsor = sponsors[_sponsor];
        sponsor.referral = _referral;

              

        if (_isAmbassador ){
            sponsor.isAmbassador = true;
            if (totalTokensSold < 5000000 * multiplier)  
                tokensToSend = safeDiv( safeMul(_tokensSent, 40 ) , 100);	// add 40% of tokens referred to ambasador account
           else 
                tokensToSend = safeDiv( safeMul(_tokensSent, 15 ) , 100);	// add 15% of tokens referred to ambasador account                	   
        }
        else	tokensToSend = safeDiv( safeMul(_tokensSent, 3 ) , 100);                                     


        if (safeAdd(tokensToSend, safeAdd(SWARMSentToETH,safeAdd(SWARMSentToETH, SWARMSentToBTC))) > maxCap)      // ensure that max cap hasn't been reached
			throw;

        if (_paymentType == 1 ) sponsor.weiReferred = _amount;
        else sponsor.satoshiReferred = _amount; 

        sponsor.tokensSent = tokensToSend;  
        SWARMSentToRef  = safeAdd(SWARMSentToRef, tokensToSend);    

        if (!swarm.transfer(_sponsor, tokensToSend)) throw;        
        ReferralProcessed(_referral, _sponsor, _amount, _paymentType, _isAmbassador, tokensToSend);

        return true;
    }



	/// computeTokensToSend() 
	/// @notice It will compute amount of tokens to be sent in exchange for payment
	/// @param _amount {uint} amount of satoshi
	/// @return  res {uint} token amount representing sale	
       function computeTokensToSend(uint _amount) internal constant returns (uint res) {

		uint totalTokenSold = SWARMSentToETH + SWARMSentToBTC;
		uint tokenPriceSatoshi ;
		uint tokenAmount;
		
       if (totalTokenSold <= (2500000 * multiplier) )
                tokenPriceSatoshi = 6700;
        else if (totalTokenSold > (2500000 * multiplier) && totalTokenSold <=  (5000000 * multiplier))
                tokenPriceSatoshi = 33000;
        else if (totalTokenSold > (5000000 * multiplier) && totalTokenSold <=  (7500000* multiplier))
                tokenPriceSatoshi = 80000;
        else if (totalTokenSold > (7500000 * multiplier) && totalTokenSold <=  (10000000* multiplier))
                tokenPriceSatoshi = 173300;
        else if (totalTokenSold > (10000000 * multiplier) && totalTokenSold <=  (12500000* multiplier))
                tokenPriceSatoshi = 290000;
        else if (totalTokenSold > (12500000 * multiplier)  && totalTokenSold <=  (15000000* multiplier))
                tokenPriceSatoshi = 430000;
        else if (totalTokenSold > (15000000  * multiplier)  && totalTokenSold <=  (17500000* multiplier))
                tokenPriceSatoshi = 593300;
        else tokenPriceSatoshi = 780000;
        
		
        tokenAmount = _amount * multiplier  /tokenPriceSatoshi;
		return tokenAmount;
	}

	/// receiveApproval() 
	/// @notice When mincap is not reached, investor can call the approveAndCall() funcgtion of 
	/// the swarm contract in order to be refunded. 
	/// @param _from {address} address of the investor
	/// @param _value {uint256} amount to be refunded	
	function receiveApproval(address _from, uint256 _value) minCapNotReached public {
		if (msg.sender != address(swarm)) throw;			// ensure that only swarm contract can call this function
		if (_value != investors[_from].SWARMSent) throw;		// compare passed value with the investor balance
		if (!swarm.transferFrom(_from, address(this), _value)) throw ;	// return token to this contract from investor
		if (!swarm.burn(_value)) throw ;				// burn tokens
		uint ETHToSend = investors[_from].weiReceived;
		investors[_from].weiReceived=0;
		uint BTCToSend = investors[_from].satoshiReceived;
		investors[_from].satoshiReceived = 0;
		if (ETHToSend > 0) {
			asyncSend(_from,ETHToSend);	// store payment in PullPayment contract to be withdrwan by investor
		}
		if (BTCToSend > 0)
			RefundBTC(investors[_from].BTCaddress ,BTCToSend);	// create an event  to manually refund BTC
	}


	/// setEthToBtcRate() 
	/// @notice This functin will be called externally every 10 munitues to update ETH/BTC ratio
	/// @param _rate {uint} new rate to set  	
	function setEthToBtcRate(uint _rate) onlyBy(BTCproxy) {
		weiToSatoshi=_rate;
	}
	

	/// finalize() 
	/// @notice This function will finalize the sale. 
	/// it will only execute if predetermined sale time passed. 
	/// it is also giving 15 days investors to withdraw refunds in case minCap hasn't been reached.	
	function finalize() onlyBy(owner) {
		// check
		if (SWARMSentToETH + SWARMSentToBTC <= maxCap  && now < endBlock) throw;	// Can only be finilized if 30 days passed
		if (SWARMSentToETH + SWARMSentToBTC < minCap && now < endBlock + 15 days) 
            		throw ;                                                                 // investors have 15 days to get their funds back before this can be executed
		if (!multisigETH.send(this.balance)) throw;									// moves the remaining ETH to the multisig address
		
		if(!swarm.transfer(reserve,SWARM_reserve)) throw;                           // transfers predetermined amount to reserve address

        	uint totalTokensSent = safeAdd(safeAdd(SWARMSentToETH, SWARMSentToBTC), SWARM_reserve); // calculates total amount of tokens sent
		uint tokensLeft = safeSub(20000000 * multiplier  , totalTokensSent);                  // calculats amounts of remaining tokens
		if (!swarm.transfer(team,tokensLeft)) throw;                                // transfers remaining tokens to the team address
			
		swarm.unlock();
		crowdsaleClosed = true;
	}


    /// drain() 
	/// @notice Failsafe drain 
	function drain() onlyBy(owner) {
		if (!owner.send(this.balance)) throw;
	}
}