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
        uint public postSaleMembers; // number of post sale members receiving tokens 
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
            if ((block.number < startBlock) || (block.number > endBlock)) throw;
            
            _;
        }

        /*
        * Events
        */
        event ReceivedETH(address investor, uint amount, uint tokenAmount);
        event PriceRangeCalculated(address investor, uint tokenAmount, uint priceETH);
        event PostSaleRecorded(address member, uint tokenAmount);


       
              
                    
        
        /// Crowdsale  {constructor}
        /// @notice fired when contract is crated. Initilizes all constnat variables.     
        function Crowdsale() {

            owner = msg.sender;         	
            multisigETH = 0xdC0ae50a6Eb66F3A41f6641cc24CF31c84c52235;
            team = 0xdC0ae50a6Eb66F3A41f6641cc24CF31c84c52235;
            SWARMSentToETH = 9875000 * multiplier;
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

            if (block.number > endBlock) throw;
                handleETH(msg.sender); 
        }


        /// start 
        /// @notice It will be called by owner to start the sale  
        function start() onlyBy(owner) {            
                        
             startBlock = block.number;
             endBlock = startBlock + 20;

            // enable this for live assuming each bloc takes 15 sec = 7 days. 
            // 4×60×24×7
            // 
            //endBlock = startBlock + 4×60×24×7;
        }

        /// postSaleTokens 
        /// @notice It will be called by the owner to send number of tokens assigned
        /// to dev and team. This informatoion will allow on slow release of tokens
        /// similar to investors. 
        /// @param  _member {address} address of dev/team member
        /// @param _SWARMToSend {uint} tokens sent to member 
        /// @return res {bool} true if transaction was successful        
        function postSaleTokens(address _member, uint _SWARMToSend)  onlyBy(owner) returns (bool){

            if ( !crowdsaleClosed) throw;

            Investor teamMember = investors[_member];
            teamMember.SWARMSent += _SWARMToSend;
            postSaleMembers ++;
            if (!swarm.transfer(_member, _SWARMToSend)) throw; // transfer SWARM tokens 
            PostSaleRecorded(_member, _SWARMToSend);
            return true;
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
        /// @param _price {uint} current price level based on the amount sent
        /// @param _totalTokensSold {uint} total tokens sold based on the computation
        /// @param _amount {uint} amount contributed
        /// @param _tokensToPurchase {uint} amount tokens resulting from calculations.
        /// @return _amount, _totalTokensSold, _tokensToPurchase  {uint, uint, uint}
        function calaculateSpan(uint _range, uint _price, uint _totalTokensSold, uint _amount, uint _tokensToPurchase) internal constant returns(uint, uint, uint) {

            uint tokensLeft = _range - _totalTokensSold;
            uint tokensPurchasable = (_amount * multiplier) / _price;
            uint tokensCost;

            // abort transation when purchase exceeds size of max cap
            if (_range == maxCap  && tokensPurchasable > tokensLeft) throw;


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
        /// @return tokensToPurchase {uint} value of tokens to purchase

        function calcuateNoOfTokensToSend(uint _amount) internal constant returns(uint) {

            uint totalTokensSold = SWARMSentToETH;

            if (totalTokensSold >= maxCap) throw;


            uint tokensToPurchase = 0;


            if (totalTokensSold < 9875000 * multiplier)
                (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(6837500 * multiplier, 8920000000000000, totalTokensSold, _amount, tokensToPurchase);           

            if (totalTokensSold >= (9875000 * multiplier) && totalTokensSold < (10887500 * multiplier))
                (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(10887500 * multiplier, 8920000000000000, totalTokensSold, _amount, tokensToPurchase);

            if (totalTokensSold >= (10887500 * multiplier) && totalTokensSold < (14937500 * multiplier))
                (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(14937500   * multiplier, 10040000000000000, totalTokensSold, _amount, tokensToPurchase);

            if (totalTokensSold >= (14937500 * multiplier) && totalTokensSold <= (20000000 * multiplier))
                (_amount, totalTokensSold, tokensToPurchase) = calaculateSpan(20000000 * multiplier, 11160000000000000, totalTokensSold, _amount, tokensToPurchase);

            return tokensToPurchase;
        }



        /// finalize() 
        /// @notice This function will finalize the sale. 
        /// it will only execute if predetermined sale time passed or all tokens are sold.  
        function finalize() onlyBy(owner) {

            if (block.number < endBlock && SWARMSentToETH < maxCap) throw; // Can only be finilized if 7 days passed or all tokens sold    
            if (!multisigETH.send(this.balance)) throw; // moves the remaining ETH to the multisig address

            uint tokensLeft = safeSub(swarm.totalSupply(), SWARMSentToETH); // calculats amounts of remaining tokens
            if (!swarm.transfer(team, tokensLeft)) throw;              
            crowdsaleClosed = true;
            swarm.unlock();
        }

        

        /// drain() 
        /// @notice Failsafe drain 
        function drain() onlyBy(owner) {
            if (!owner.send(this.balance)) throw;
        }
    }