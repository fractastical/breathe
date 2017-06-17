  pragma solidity ^ 0.4 .11;


  contract SafeMath {
      function safeMul(uint a, uint b) internal returns(uint) {
          uint c = a * b;
          assert(a == 0 || c / a == b);
          return c;
      }

      function safeDiv(uint a, uint b) internal returns(uint) {
          assert(b > 0);
          uint c = a / b;
          assert(a == b * c + a % b);
          return c;
      }

      function safeSub(uint a, uint b) internal returns(uint) {
          assert(b <= a);
          return a - b;
      }

      function safeAdd(uint a, uint b) internal returns(uint) {
          uint c = a + b;
          assert(c >= a && c >= b);
          return c;
      }

      function assert(bool assertion) internal {
          if (!assertion) {
              throw;
          }
      }
  }

  contract ERC20 {
      uint public totalSupply;

      function balanceOf(address who) constant returns(uint);

      function allowance(address owner, address spender) constant returns(uint);

      function transfer(address to, uint value) returns(bool ok);

      function transferFrom(address from, address to, uint value) returns(bool ok);

      function approve(address spender, uint value) returns(bool ok);
      event Transfer(address indexed from, address indexed to, uint value);
      event Approval(address indexed owner, address indexed spender, uint value);
  }


  contract Ownable {
      address public owner;

      function Ownable() {
          owner = msg.sender;
      }

      modifier onlyOwner() {
          if (msg.sender == owner)
              _;
      }

      function transferOwnership(address newOwner) onlyOwner {
          if (newOwner != address(0)) owner = newOwner;
      }

      function kill() {
          if (msg.sender == owner) selfdestruct(owner);
      }

  }

  contract Pausable is Ownable {
      bool public stopped;

      modifier stopInEmergency {
          if (stopped) {
              throw;
          }
          _;
      }

      modifier onlyInEmergency {
          if (!stopped) {
              throw;
          }
          _;
      }

      // called by the owner in emergency, triggers stopped state
      function emergencyStop() external onlyOwner {
          stopped = true;
      }

      // called by the owner to end of emergency, returns to normal state
      function release() external onlyOwner onlyInEmergency {
          stopped = false;
      }

  }

 /*
  *  The SWARM Token 
  */

  contract SWARM is ERC20, SafeMath, Ownable {

      /* Public variables of the token */
      string public name;
      string public symbol;
      uint8 public decimals; //How many decimals to show.
      string public version = 'v0.1';
      uint public initialSupply;
      uint public totalSupply;
      bool public locked;
      address public crowdSaleAddress;      

      mapping(address => uint) balances;
      mapping(address => mapping(address => uint)) allowed;

      // lock transfer during the ICO
      modifier onlyUnlocked() {
          if (msg.sender != crowdSaleAddress && locked) throw;
          _;
      }


      /*
       *  The SWARM Token created with the time at which the crowdsale ends
       */

      function SWARM(address _crowdSaleAddress) {
          // lock the transfer function during the crowdsale
          locked = true;          
          initialSupply = 100000000 * (10000000000); // multiplied to allow 10 decimals
          totalSupply = initialSupply;                        
          name = 'SWARM Token'; // Set the name for display purposes     
          symbol = 'SWARM'; // Set the symbol for display purposes  
          decimals = 10; // Amount of decimals for display purposes
          crowdSaleAddress = _crowdSaleAddress;

          // address of multisig wallet for pre-sale customers
          balances[0x6C88e6C76C1Eb3b130612D5686BE9c0A0C78925B] = 2000000;

          // address of multisig wallet for Swiss conversion customers. 
          balances[0x6C88e6C76C1Eb3b130612D5686BE9c0A0C78925B] = 1500000;
          balances[crowdSaleAddress] = totalSupply;
      }

      function unlock() onlyOwner {
          locked = false;
      }



      function transfer(address _to, uint _value) onlyUnlocked returns(bool) {
          balances[msg.sender] = safeSub(balances[msg.sender], _value);
          balances[_to] = safeAdd(balances[_to], _value);
          Transfer(msg.sender, _to, _value);
          return true;
      }

      function transferFrom(address _from, address _to, uint _value) onlyUnlocked returns(bool) {
          var _allowance = allowed[_from][msg.sender];

          balances[_to] = safeAdd(balances[_to], _value);
          balances[_from] = safeSub(balances[_from], _value);
          allowed[_from][msg.sender] = safeSub(_allowance, _value);
          Transfer(_from, _to, _value);
          return true;
      }

      function balanceOf(address _owner) constant returns(uint balance) {
          return balances[_owner];
      }

      function approve(address _spender, uint _value) returns(bool) {
          allowed[msg.sender][_spender] = _value;
          Approval(msg.sender, _spender, _value);
          return true;
      }



      function allowance(address _owner, address _spender) constant returns(uint remaining) {
          return allowed[_owner][_spender];
      }

  }




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

      // specify address of token contract
      function updateTokenAddress(SWARM _SWARMAddress) public onlyBy(owner) returns(bool) {

          swarm = _SWARMAddress;
          return true;

      }


      /// {fallback function}  
      /// @notice It will call internal function which handels allocation of Ether and calculates SWARM tokens.   
      function () payable {
          // use this for live
          //if (block.number > endBlock ) throw;
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
      /// @return _amount, _totalTokensSold, _tokensToPurchase  {uint, uint, uint}
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
      /// @return tokensToPurchase {uint} true if transaction was successful

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