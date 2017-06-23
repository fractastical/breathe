pragma solidity ^0.4.11;

import "./Ownable.sol";
import "./SafeMath.sol";
import "./ERC20.sol";

    
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
        uint multiplier = 10000000000;
        

        mapping(address => uint) balances;
        mapping(address => mapping(address => uint)) allowed;

        // lock transfer during the ICO
        modifier onlyUnlocked() {
            if (msg.sender != crowdSaleAddress && locked) throw;
            _;
        }


       modifier checkTransferConditions(uint tokensToBeMoved){
            
            // only allow transfer of tokens by crowd sale contract during crowdsale
            // or owner 
            if (msg.sender != crowdSaleAddress && msg.sender != owner && locked ) throw;
            
            // allow transfer of tokens by the owner or enforce withdrawing rules.
            // Over a year investor can move all their tokens in 42 days intervals,
            // 9% each time or cumulative value for prior periods. 
            // first withdrawla will be available after 29 days. 
            
            if (msg.sender != owner && msg.sender!= crowdSaleAddress) {
            
            
            uint fourtyTwoDays = 42 * 24 * 60 * 4;
            
            uint twentyNineDays = 29 * 24 * 60 * 4;
            //uint percentile = 9;
            Crowdsale crowdSale = Crowdsale(crowdSaleAddress);
            var (, initialTokens) = crowdSale.investors(msg.sender);
            //uint startBlock = crowdSale.endBlock() + sevenDays;
            
            uint balance = balances[msg.sender] - initialTokens;
            
            // calculate number of payout levels based on 42 days length and end date of crowd sale plus 29 days. 
            uint i;
            if (block.number - crowdSale.endBlock() - twentyNineDays ) <= 0
                i = 0;
            else
                i = ((block.number - crowdSale.endBlock() - twentyNineDays )/ fourtyTwoDays) +1 ;
            
            // determine tokens number to be moved in case user received some
            // tokens in meantime after crowdsale ended. 
            if (balance < tokensToBeMoved)
                tokensToBeMoved -= balance;
            else 
                tokensToBeMoved = 0;         
        
        // determine if amount of tokens to be moved is not larger than 
        // 1/9 * i   
            if (tokensToBeMoved * 100 / initialTokens > 9 * i)
                throw;
            }
                
                _;
                    
        }
        
        
    
        /*
        *  The SWARM Token created with the time at which the crowdsale ends
        */

        function SWARM(address _crowdSaleAddress) {
            // lock the transfCrowdsaleer function during the crowdsale          
            locked = true;          
            initialSupply = 100000000 * multiplier; // multiplied to allow 10 decimals
            totalSupply = initialSupply;                        
            name = 'SWARM Token'; // Set the name for display purposes     
            symbol = 'SWARM'; // Set the symbol for display purposes  
            decimals = 10; // Amount of decimals for display purposes
            crowdSaleAddress = _crowdSaleAddress;

            // address of multisig wallet for pre-sale customers
            balances[0x6C88e6C76C1Eb3b130612D5686BE9c0A0C78925B] = 6500000  *multiplier ;

            // address of multisig wallet for Swiss conversion customers. 
            balances[0x6C88e6C76C1Eb3b130612D5686BE9c0A0C78925B] = 3375000 * multiplier;
            balances[crowdSaleAddress] = totalSupply - 9875000 * multiplier;
        }

        function unlock() onlyOwner {
            locked = false;
        }



        function transfer(address _to, uint _value) checkTransferConditions(_value) returns(bool) {
            balances[msg.sender] = safeSub(balances[msg.sender], _value);
            balances[_to] = safeAdd(balances[_to], _value);
            Transfer(msg.sender, _to, _value);
            return true;
        }

        function transferFrom(address _from, address _to, uint _value) checkTransferConditions(_value) returns(bool) {
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