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
      //uint public unlockBlock;

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
          //unlockBlock=  now + 45 days; // (testnet) - for mainnet put the block number

          initialSupply = 100000000 * (10000000000); // multiplied to allow 10 decimals
          totalSupply = initialSupply;
          //balances[msg.sender] = initialSupply;   // Give the creator all initial tokens                    
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