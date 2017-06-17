import "./SafeMath.sol";
import "./SWARM.sol";
import "./Pausable.sol";



  //Crowdsale Smart Contract for the SWARM project
  //This smart contract collects ETH and in return sends SWARM tokens to the investors



  contract Crowdsale is SafeMath, Pausable {

      // to store Investor info
      struct Investor {
          uint weiReceived; // amount of ETH contributed	
          uint SWARMSent; // amount of tokens  sent    
      }



      SWARM public swarm; // SWARM contract reference
      address public owner; // Contract owner (swarm.fund team)
      address public multisigETH; // Multisig contract that will receive the ETH	
      uint public ETHReceived; // Number of ETH received	
      uint public SWARMSentToETH; // Number of SWARM sent to ETH contributors	
      uint public startBlock; // Crowdsale start block
      uint public endBlock; // Crowdsale end block   
      uint public maxCap; // Maximum number of SWARM to sell    
      uint public minInvestETH; // Minimum amount to invest
      bool public crowdsaleClosed; // Is crowdsale still on going        
      address public team; // address at which the team SWARM will be sent


      uint public etherInvestors; // number of investors who used ether
      uint multiplier = 10000000000; // to provide 10 decimal values
      mapping(address => Investor) public investors; //investor list


      /// onlyBy()
      /// @notice to be used when certain account is required to access the function 
      /// @param a {address}  The address of the authorised individual   
      modifier onlyBy(address a) {
          if (msg.sender != a) throw;
          _;
      }


      /// respectTimeFrame
      /// @notice to verify if action is not performed out of the campaing range    
      modifier respectTimeFrame() {
          if ((now < startBlock) || (now > endBlock)) throw;

          //enable this for live
          // if ((block.number <= startBlock) || (block.number > endBlock) throw;)
          _;
      }

      /*
       * Events
       */
      event ReceivedETH(address investor, uint amount, uint tokenAmount);
      event PriceRangeCalculated(address investor, uint tokenAmount, uint priceSatoshi);


      /// Crowdsale  {constructor}
      /// @notice fired when contract is crated. Initilizes all constnat variables.     
      function Crowdsale() {

          owner = msg.sender;
          //swarm = SWARM(0xfb0CAa5A324E5a878c8bC98CE1430976992A964c);		
          multisigETH = 0x0000000000000000000000000000000000;
          team = 0x0000000000000000000000000000000000;
          SWARMSentToETH = 2500000 * multiplier;
          minInvestETH = 1 ether;
          startBlock = 0; // should wait for the call of the function start
          endBlock = 0; // should wait for the call of the function start	                	    
          maxCap = 20000000 * multiplier;
      }


      function updateTokenAddress(SWARM _SWARMAddress) public onlyBy(owner) returns(bool) {

          swarm = _SWARMAddress;
          return true;

      }


      /// {fallback function}  
      /// @notice It will call internal function which handels allocation of Ether and calculates SWARM tokens.   
      function () payable {
          if (now > endBlock) throw;
          handleETH(msg.sender);
      }


      /// start 
      /// @notice It will be called by owner to start the sale  
      function start() onlyBy(owner) {
          startBlock = now;
          endBlock = now + 30 days;
          // enable this for live assuming each bloc takes 15 sec 
          // startBlock = block.number;
          // endBlock = startBlock + 172800;
      }



      /// handleETH 
      /// @notice It will be called by fallback function whenever ether is sent to it
      /// @param   _investor {address} address of beneficiary
      /// @return res {bool} true if transaction was successful
      function handleETH(address _investor) internal stopInEmergency respectTimeFrame returns(bool res) {
          if (msg.value < minInvestETH) throw; // stop when required minimum is not sent

          uint SWARMToSend = calcuateNoOfTokensToSend(msg.value);

          if (safeAdd(SWARMSentToETH, SWARMToSend) > maxCap) // ensure that max cap hasn't been reached
              throw;

          Investor investor = investors[_investor];

          if (!swarm.transfer(_investor, SWARMToSend)) throw; // transfer SWARM tokens        				 
          investor.SWARMSent = safeAdd(investor.SWARMSent, SWARMToSend);
          investor.weiReceived = safeAdd(investor.weiReceived, msg.value);
          ETHReceived = safeAdd(ETHReceived, msg.value); // Update the total Ether recived
          SWARMSentToETH = safeAdd(SWARMSentToETH, SWARMToSend);
          etherInvestors++; // keep count of investors       

          ReceivedETH(_investor, msg.value, SWARMToSend); // register event
          return true;
      }



      /// calaculateSpan 
      /// @notice It is called by CalculateNoOfTokens to determine the price in case purchase spans more than
      /// one pricing range. 
      /// @param _range {uint} current range computed
      /// @return 
      function calaculateSpan(uint _range, uint _price, uint _totalTokensSold, uint _amount, uint _tokensToPurchase) internal constant returns(uint, uint, uint) {

          uint tokensLeft = _range - _totalTokensSold;
          uint tokensPurchasable = (_amount * multiplier) / _price;
          uint tokensCost;


          if (tokensPurchasable > tokensLeft) {
              tokensCost = (tokensLeft * _price) / multiplier;
              _amount -= tokensCost;
              _totalTokensSold += tokensLeft;
              _tokensToPurchase += tokensLeft;
              PriceRangeCalculated(msg.sender, tokensLeft, _price);
          } else {

              PriceRangeCalculated(msg.sender, tokensPurchasable, _price);
              _tokensToPurchase += tokensPurchasable;
          }



          return (_amount, _totalTokensSold, _tokensToPurchase);
      }


      /// calcuateNoOfTokensToSend 
      /// @notice It is called by handleETH to determine amount of tokens for given contribution
      /// @param _amount {uint} current range computed
      /// @return tokensToPurchase {uintl} true if transaction was successful

      function calcuateNoOfTokensToSend(uint _amount) internal returns(uint) {

          uint totalTokensSold = SWARMSentToETH;


          uint tokensToPurchase = 0;


          if (totalTokensSold <= 2500000 * multiplier)
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(2500000 * multiplier, 370000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (2500000 * multiplier) && totalTokensSold < (5000000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(5000000 * multiplier, 1480000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (5000000 * multiplier) && totalTokensSold < (7500000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(7500000 * multiplier, 2590000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (7500000 * multiplier) && totalTokensSold < (10000000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(10000000 * multiplier, 5190000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (10000000 * multiplier) && totalTokensSold < (12500000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(12500000 * multiplier, 6480000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (12500000 * multiplier) && totalTokensSold < (15000000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(15000000 * multiplier, 7780000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (15000000 * multiplier) && totalTokensSold < (17500000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(17500000 * multiplier, 9070000000000000, totalTokensSold, _amount, tokensToPurchase);

          if (totalTokensSold >= (17500000 * multiplier) && totalTokensSold < (20000000 * multiplier))
              (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(20000000 * multiplier, 10370000000000000, totalTokensSold, _amount, tokensToPurchase);

          return tokensToPurchase;
      }



      /// finalize() 
      /// @notice This function will finalize the sale. 
      /// it will only execute if predetermined sale time passed.     
      function finalize() onlyBy(owner) {

          if (now < endBlock) throw; // Can only be finilized if 30 days passed
          // investors have 15 days to get their funds back before this can be executed
          if (!multisigETH.send(this.balance)) throw; // moves the remaining ETH to the multisig address

          uint tokensLeft = safeSub(swarm.totalSupply(), SWARMSentToETH); // calculats amounts of remaining tokens
          if (!swarm.transfer(team, tokensLeft)) throw;

          swarm.transfer(team, tokensLeft);
          swarm.unlock();
          crowdsaleClosed = true;
      }



      /// drain() 
      /// @notice Failsafe drain 
      function drain() onlyBy(owner) {
          if (!owner.send(this.balance)) throw;
      }
  }