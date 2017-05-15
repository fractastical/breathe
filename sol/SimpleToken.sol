    pragma solidity ^0.4.6;
   
    /// @dev limited token contract
    contract MyToken {
        /* Public variables of the token */
        string public standard = 'Token 0.1';
        string public name;
        string public symbol;
        uint8 public decimals;
        uint256 public totalSupply;
        address public owner;
        address public ldAddress;

        /* This creates an array with all balances */
        mapping (address => uint256) public balanceOf;
       

        /* This generates a public event on the blockchain that will notify clients */
        event Transfer(address indexed from, address indexed to, uint256 value);

        /* Initializes contract with initial supply tokens to the creator of the contract */
        function MyToken(	
            uint256 initialSupply,
            string tokenName,
            uint8 decimalUnits,
            string tokenSymbol,
            address liqiuidDemocracyAddress
            ) {
            balanceOf[msg.sender] = initialSupply;              // Give the creator all initial tokens
            totalSupply = initialSupply;                        // Update total supply
            name = tokenName;                                   // Set the name for display purposes
            symbol = tokenSymbol;                               // Set the symbol for display purposes
            decimals = decimalUnits;   
            ldAddress = liqiuidDemocracyAddress;
                                     // Amount of decimals for display purposes
          if (!msg.sender.send(msg.value))
          throw;                         // Send back any ether sent accidentally

           owner = msg.sender;
        }
       
        /// @dev Used to create new tokens. It can be only called by owner or the Liquid Democracy 
        /// contract
        /// @param target - address of the member receiving tokens
        /// @param  mintedAmount - amount of new tokens created. 
        function mintToken(address target, uint256 mintedAmount)  {

            if (owner != msg.sender ||  ldAddress != msg.sender) throw;
            balanceOf[target] += mintedAmount;
            totalSupply += mintedAmount;
            Transfer(0, target, mintedAmount);
        
        }

         ///@dev destroy the contract when not needed 
         function kill() {
             if (msg.sender == owner) selfdestruct(owner);
    }

        /* This unnamed function is called whenever someone tries to send ether to it */
        function () {
            throw;     // Prevents accidental sending of ether
        }
    }
