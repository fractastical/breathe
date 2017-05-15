     pragma solidity ^0.4.6;
    
    //Contract token is found in its own file. 
    //These here are interfaces to access functions and variable of token contract.       
    contract token { 

                // balance of tokens for individual member
                mapping (address => uint256) public balanceOf;  


                // this function creates new tokens and assigns it to the purchaser.
                // It can be only called by the owner of itself or from functions
                // in this contract which is registered with MyToken contract. 
                                      
                function mintToken (address target, uint256 mintedAmount);
    }

    // @notice a contract which is inherited by 
    // main Association contract. owned holds several housekeeping functions 
    contract owned {
        address public owner;

        
        /// @notice constructor, sets the owner of the contract
        function owned() {
            owner = msg.sender;
        }

        /// @notice modifier to be used in functions, which can be only called 
        /// by the owner, otherwise call to function will be thrown. 
        modifier onlyOwner {
            if (msg.sender != owner) throw;
            _;
        }

        /// @notice used to transfer Ownership
        /// @param newOwner  - new owner of the contract
        function transferOwnership(address newOwner) onlyOwner {
            owner = newOwner;
            
        }	
        
        /// @dev this function will allow on self destruction of this contract. 
        function kill() {
            if (msg.sender == owner) selfdestruct(owner);
        }
    }


    /// @dev Liquid Democracy contract. Allows new members to be registered and 
    /// aquire tokens. Number of acquired tokens also represents user voting power. 
    /// Tokens are held in standard token contract defined here. 
    contract ld is owned {

        // How long debate should be held in minutes    
        uint public debatingPeriodInMinutes;
        // proposals array 
        Proposal[] public proposals;
        // to keep number of proposals for easy access
        uint public numProposals;
        // to keep numbrer of members for easy access 
        uint public numMembers;
        // to retrieve a member position in the array without searching for it
        mapping (address => uint) public memberId;   
        // to keep vote weight of each member
        mapping (address => uint256) public voteWeight;
        // keeps delegated votes for each member 
        DelegatedVote[] public delegatedVotes;
        // list of registered members
        Member[] public members;
        // address of token contract
        token public sharesTokenAddress;
        // total number of tokens in circulation 
        uint public tokensInCirculation;
        // cost of token in wei
        uint public singleTokenCost;
        // date of tokens sale start date in Uinx timestamp
        uint public tokenSaleStartDate;
        // date of tokens sale end date in Unix timestamp
        uint public tokenSaleEndDate;
        // minimum quorum
        uint public minimumQuorum;
    
        
    
        // to store member info
        struct Member {
            // the address of member
            address member;
            // true if member can vote
            bool canVote;
            // date member created  
            uint memberSince;
            // first name of member
            string firstName;
            // last name of member 
            string lastName;
            // email address of member
            string userID;
            // true if user has delegated their vote
            bool delegated; 
            // for verification when logging in
            // email address hashed with password    f
            bytes32 memberHash;
            // true if user is admin
            bool admin;  
            // if provided referral address is stored
            address referral; 
        }
        
        // to store votes delegated by user to another user
        struct DelegatedVote {
            // address of the nominee
            address nominee;
            // address of the voter
            address voter;
            // amount of vote credits, each token is 1 credit 
            uint weight;
        }

        // to store proposal info
        struct Proposal {
            // address of the proposal beneficiary
            address recipient;
            // amount of the proposal for beneficiary
            uint amount;
            // description of the proposal
            string description;
            // title of the proposal
            string title;
            // creator of the proposal 
            address creator;
            // Unix timestamp of voting deadline
            uint votingDeadline;
            // true if proposal has passed voting deadline and tallying has been run
            uint executed;
            // number of votes cast for this proposal, votes are number of total voting weights of participating members
            uint numberOfVotes;    
            // used for security to  check if user knows the combination of info used in hash
            bytes32 proposalHash;
            // array of votes for and against the proposal
            Vote[] votes;
            // list of voting status of members  
            mapping (address => bool) voted;
            // implemented to store string of proposal stats. 
            // this was due to the fact that this structure reached limit of elements allowed by solidity
            // to still accomplish this task, number of variables are stored in the string and then
            // parsed when needed
            string proposalStats;
            
        }

        //  to keep info about voting of each member for the proposal
        struct Vote {
            // true if user voted for proposal
            bool inSupport;
            // address of the voter
            address voter;
        }





        // triggered when new proposal is added
        event ProposalAdded(uint proposalID, address recipient, uint amount, string description, string title);
        // triggered when vote is cast
        event Voted(uint proposalID, bool position, address voter);
        // triggered when votes on proposals are tallied
        event ProposalTallied(uint proposalID, uint yea , uint nay, uint quorum, uint executed);
        // triggered when rules for voting are changed		
        event ChangeOfRules(uint minimumQuorum, uint debatingPeriodInMinutes);
        // triggered when new member is created or updated
        event MembershipChanged(address member, bool isMember, string firstName, string lastName, string userID, address memberReferral);
        // triggered when votes are deleged by a mebmber
        event Delegated(address nominatedAddress, address voters, uint voteIndex);
        // triggered when delegations are reset by admim
        event DelegationReset(bool status);
        // triggered when tokens are purchased
        event BuyTokens(uint numOfTokens, address buyer, uint value); 
        // executed when meber account "canVote" is changed 
        event BlockUnblockMember(address member, bool status);
        // executed when ownership of this contract is transferred
        event OwnershipTransfer(bool result);
        // executed when member cancels vote delegation
        event CancelDelegation(address  nominatedAddress, address voter, uint voteWeight);
        // executed when user buys new tokens or reduces them  and their vote weight is updated
        event VoteWeightUpdated(address member, uint weightAdded, uint totalWeight);
        // executed when tokens price is changed
        event TokenParmsChange(uint startDate, uint endDate, uint tokenPrice);
        
        /* modifier that allows only shareholders to participate in auction */
        modifier onlyShareholders() {
            if (sharesTokenAddress.balanceOf(msg.sender) == 0) throw;
                _;
        }
        
        

        /// @dev This is constructor function. It allows to initialize token address
        /// token cost, token sale start date, token sale end date
        /// @param minimumSharesToPassAVote - min quorum
        /// @param minutesForDebate - number of minutes after which debate should expire
        /// @param sharesAddress - address of token contract
        /// @param tokenCost - cost of token in wei
        
        function Association(uint minimumSharesToPassAVote, uint minutesForDebate,  token sharesAddress, uint tokenCost) {
            changeVotingRules(minimumSharesToPassAVote, minutesForDebate);        
            sharesTokenAddress = sharesAddress;
            singleTokenCost =  tokenCost;
            tokenSaleStartDate = now;
            tokenSaleEndDate = now + 30 days;

        }

        /// @dev this function allows on changing minimum quorum and length of debate on proposal
        /// @param minimumSharesToPassAVote - minimum quorum
        /// @param minutesForDebate - length of debate in minutes

        function changeVotingRules( uint minimumSharesToPassAVote, uint minutesForDebate) onlyOwner {
            
            if (minimumSharesToPassAVote == 0 ) minimumSharesToPassAVote = 1;
            minimumQuorum = minimumSharesToPassAVote;
            debatingPeriodInMinutes = minutesForDebate;           
            
            ChangeOfRules(minimumQuorum, debatingPeriodInMinutes);
        }


        /// @dev start new proposal 
        /// @param beneficiary - an address of the member who will receive the benefits of this proposal if it is approved
        /// @param etherAmount - amount of ether beneficiary will receive if proposal is approved
        /// @param proposalDescription - description of the proposal 
        /// @param proposalTitle - proposal title
        /// @param transactionBytecode - can be sent to increase security 

        function newProposal(
            address beneficiary,
            uint etherAmount,
            string proposalDescription,
            string proposalTitle,
            bytes transactionBytecode
        )
            onlyShareholders()
            returns (uint proposalID)
        {   
        
            proposalID = proposals.length++;
            Proposal p = proposals[proposalID];
            p.recipient = beneficiary;
            p.amount = etherAmount;
            p.description = proposalDescription;
            p.title = proposalTitle;
            p.proposalHash = sha3(beneficiary, etherAmount, transactionBytecode);
            p.votingDeadline = now + debatingPeriodInMinutes * 1 minutes;
            p.executed = 0;
            p.numberOfVotes = 0;          
            p.creator = msg.sender;
            
            
            numProposals = proposalID+1;

        ProposalAdded(proposalID, beneficiary, etherAmount, proposalDescription, proposalTitle);
        }



        /// @dev to check if proposal code is matching the params. 
        /// @param proposalNumber - position of proposal in array, starts with 0
        /// @param beneficiary -  beneficiary of the proposal 
        /// @param etherAmount - ether amount for the beneficiary
        /// @param transactionBytecode 
        /// @return  - True if code checks out
        function checkProposalCode(
            uint proposalNumber,
            address beneficiary,
            uint etherAmount,
            bytes transactionBytecode
        )
            constant
            returns (bool codeChecksOut)
        {
            Proposal p = proposals[proposalNumber];
            return p.proposalHash == sha3(beneficiary, etherAmount, transactionBytecode);
        }


        /// @dev it allows to change price of token and sale start and end dates
        /// @param start - Unix time stamp of the token sale start date
        /// @param end - Unix time stamp of the token sale end date
        /// @param tokenPrice - token price in wei

        function changeTokenParms(uint start, uint end, uint tokenPrice){

    
            if (start != 0)   tokenSaleStartDate = start;
            if (end !=0)  tokenSaleEndDate = end;
            if (tokenPrice !=0)  singleTokenCost =tokenPrice ;
            TokenParmsChange(start, end, tokenPrice);

        }

        /// @dev allows on transferring ownership of this contract
        /// @param newOwner - address of the new owner

        function transferOwnership(address newOwner) onlyOwner {
        
            // update member records
            members[memberId[newOwner]].admin = true;
            members[memberId[msg.sender]].admin = false;
            
            // call base contract 
            owned.transferOwnership(newOwner);
            OwnershipTransfer(true);
        }	



        /// @dev it saves the vote of the member
        /// @param proposalNumber - position of the proposal in array
        /// @param supportsProposal - true if in favor of proposal
        /// @return uint - new vote id

        function vote(uint proposalNumber, bool supportsProposal)
        
        
            onlyShareholders()
            returns (uint voteID)
        {
            Proposal p = proposals[proposalNumber];
            if (p.voted[msg.sender] == true ||  p.executed > 0) throw;

            voteID = p.votes.length++;
            p.votes[voteID] = Vote({inSupport: supportsProposal, voter: msg.sender});
            p.voted[msg.sender] = true;
            p.numberOfVotes = voteID +1;
            Voted(proposalNumber,  supportsProposal, msg.sender);
            return voteID;
        }
        
        
        /// @dev helper function returning status of user vote for proposal
        /// @param proposalNumber - position of proposal in array
        /// @param voter - address of voter
        /// @return bool - value of voting status, true if voted, false if didn't vote
        function hasVoted(uint proposalNumber, address voter) constant returns (bool){
            
            Proposal p = proposals[proposalNumber];
            return  p.voted[voter] ;
        }

        /// @dev helper function returning number of votes for proposal 
        /// @param proposalNumber - position of proposal in array
        /// @return uint - number of votes for proposal 
        function numOfVotes(uint proposalNumber) constant returns (uint){
        
            Proposal p = proposals[proposalNumber];
            return p.votes.length;        
        }
            
        /// @dev returns choice of the voter for proposal
        /// @param  proposalNumber - position of proposal in the array
        /// @param voter - address of a member to retrieve voting status for   
        /// @return bool - true if member voted for the proposal and and false if against it    

        function howVoted(uint proposalNumber, address voter) constant returns (bool){
            
            Proposal p = proposals[proposalNumber];
            
            for (uint i = 0; i <  p.votes.length; ++i) {
                Vote v = p.votes[i];
                
                if (v.voter == voter) return v.inSupport;                
            }            
        }
        
        /// @dev helper function to return status if delegated member voted already
        /// @param proposalNumber - position of proposal in array 
        /// @param voter - address of a member to retrieve status of vote
        /// @return bool - true if delegate has voted and false if didn't
        function hasDelegateVoted(uint proposalNumber, address voter) constant returns (bool){
            
            for (uint i = 0; i < delegatedVotes.length; i++){
                if (delegatedVotes[i].voter== voter){
                    uint id = memberId[delegatedVotes[i].nominee];
                    Member m = members[id];
                    if (m.delegated){
                        hasDelegateVoted(proposalNumber, delegatedVotes[i].nominee);
                    }
                    else {
                            return  hasVoted(proposalNumber, delegatedVotes[i].nominee );
                    }
                }
            }
        }
        

              
        /// @dev returns choice of the delegate vote  for proposal
        /// @param  proposalNumber - position of proposal in the array
        /// @param voter - address of a delegate to retrieve voting status for   
        /// @return bool - true if delegate voted for the proposal and and false if against it  

        function howDelegateVoted(uint proposalNumber, address voter) constant returns (bool){
            for (uint i = 0; i < delegatedVotes.length; i++){
                if (delegatedVotes[i].voter== voter){
                    uint id = memberId[delegatedVotes[i].nominee];
                    Member m = members[id];
                    if (m.delegated){
                        howDelegateVoted(proposalNumber, delegatedVotes[i].nominee);
                    }
                    else{
                            return  howVoted(proposalNumber, delegatedVotes[i].nominee );
                    }
                }
            }
            
        }

        
        /// @dev  used to check current voting status of proposal before the votes are tallied
        /// @param proposalNumber - position of proposal in array
        /// @return string - concatenated list of parameters with their values separated by semicolons ":" and commas

        function calculateVotes(uint proposalNumber) constant returns (string){
            
        
        uint quorum = 0;
        uint votes = 0;
        uint yea = 0;
        uint nay = 0;
        uint totalMemberCount = members.length;
        
        Proposal p = proposals[proposalNumber];

        for (uint i = 0; i <  p.votes.length; ++i) {
            Vote v = p.votes[i];
            uint voteWeightTmp = voteWeight[v.voter];
                
            votes += voteWeightTmp ;
            if (v.inSupport) {
                yea += voteWeightTmp ;
                } 
                else {
                    nay += voteWeightTmp ;
                }
            }

        quorum = votes * 100/ tokensInCirculation;
        
        string memory tempString = strConcat( "{'yea':", uintToString(yea), ", 'nay':", uintToString(nay));
                tempString = strConcat( tempString, ", 'quorum':", uintToString(quorum), ", 'votes':");
                tempString = strConcat( tempString, uintToString(votes), "}", "");
            
        return tempString;
        }
        

        /// @dev tallies proposal votes and saves it. It sets status of proposal to executed. 
        /// @param proposalNumber -  position of proposal in array
        /// @param transactionBytecode - to increase security
        /// @return result - concatenated string of values of voting status
        function executeProposal(uint proposalNumber, bytes transactionBytecode) returns (uint256 result) {
            Proposal p = proposals[proposalNumber];
            /* Check if the proposal can be executed */            
            if (now < p.votingDeadline  /* has the voting deadline arrived? */
                ||  p.executed   > 0     /* has it been already executed? */
                ||  p.proposalHash != sha3(p.recipient, p.amount, transactionBytecode)) /* Does the transaction code match the proposal? */
                throw; 

            /* tally the votes */
        uint quorum = 0;
        uint votes = 0;
        uint yea = 0;
        uint nay = 0;
        uint totalMemberCount = members.length;
        

            for (uint i = 0; i <  p.votes.length; ++i) {
                Vote v = p.votes[i];
                uint voteWeightTmp = voteWeight[v.voter];
                
                votes += voteWeightTmp ;
                if (v.inSupport) {
                    yea += voteWeightTmp ;
                } else {
                    nay += voteWeightTmp ;
                }
            }
            quorum = votes * 100/ tokensInCirculation;    
            /* execute result */
            if (quorum >= minimumQuorum) {
                        
            if (yea > nay ) {
                /* has quorum and was approved */
                p.executed = 1;             
                }
            else {
                // it was executed but didn't pass 
                p.executed = 2;
                }
            }
            string memory tempString = strConcat( "{'yea':", uintToString(yea), ", 'nay':", uintToString(nay));
            tempString = strConcat( tempString, ", 'quorum':", uintToString(quorum), ", 'votes':");
            tempString = strConcat( tempString, uintToString(votes), "}", "");
            p.proposalStats = tempString; 
            
        // Fire Events
        ProposalTallied(proposalNumber, yea, nay, quorum, p.executed);
        result = p.executed;
        }

        
        /// @dev facilitates buying of tokens
        /// @param numOfTokens - number of tokens to purchased
        /// @return bool - true if executed

        function buyTokens(uint numOfTokens) payable returns (bool){            

            if (now < tokenSaleStartDate || now > tokenSaleEndDate ) throw;

            if (msg.sender.balance == 0) throw;

            uint totalTokenCost = singleTokenCost * numOfTokens;
            uint userBalance = msg.sender.balance ;
            uint maxTokenToBuy = userBalance / singleTokenCost;
            
            if ( numOfTokens >= maxTokenToBuy || totalTokenCost > msg.value){               
                    BuyTokens(0, msg.sender, msg.value);               
                    throw; 
                    } 
            
            sharesTokenAddress.mintToken(msg.sender, numOfTokens);
            tokensInCirculation += numOfTokens;
            
            if (!updateVoteWeight( msg.sender, numOfTokens)) throw;
            BuyTokens(numOfTokens, msg.sender, msg.value);

            return true; 
        }


        /// @dev updates vote weight based on number of purchased tokens 
        /// @param member - address of member to update the vote weight
        /// @param numTokens - number of tokens purchased indicating vote weight
        /// @return bool - true if executed

        function updateVoteWeight(address member, uint numTokens) private returns (bool success){

                    voteWeight[member] += numTokens;
                    VoteWeightUpdated(member, numTokens, voteWeight[member]);
                    return true;                        
        }


        /// @dev allows to cancel the delegation. It will cancel delegation on several 
        /// levels through use of recursive call. 
        /// @param voter - address of the member who wants to cancel delegation
        /// @param index - position in array of delegated votes
        /// @param first - true if this is first iteration and index needs to be determined 

        function removeDelegation(address voter, uint index, bool first) {
            
            uint id;        

            for (uint i = 0; i < delegatedVotes.length; i++){

                if (delegatedVotes[i].voter== voter){
                    uint idNominee =  memberId[delegatedVotes[i].nominee];
                    Member n = members[idNominee];
                    if (n.delegated){
                        removeDelegation(delegatedVotes[i].nominee, index, false);
                    }
                    else{
                        if (first) index = i;
                        
                        DelegatedVote nv = delegatedVotes[i];           
                        DelegatedVote vv = delegatedVotes[index]; 
                        voteWeight[nv.nominee] -= vv.weight ;									
                        voteWeight[vv.voter] += vv.weight ;
                        id = memberId[vv.voter];
                        Member m = members[id];
                        m.delegated = false;
                        CancelDelegation(nv.nominee, voter, vv.weight);
                        delete delegatedVotes[index];
                    }
                }
            }            
        }
        
        
        /// @dev allows to delgate votes to another member
        /// @param nominatedAddress - address of the member to delegate vote to 
        /// @return voteIndex - position in the array of the delegatio record
        function delegate(address nominatedAddress) returns (uint voteIndex) {
            
            uint id;
                
            uint weight = 0;
            id = memberId[msg.sender];
            Member m = members[id];
            //don't allow members delegation to themselves
            if (nominatedAddress != msg.sender){
                //test if member is not banned
                if (m.canVote){
                    //check if member hasn't delegated their vote yet
                    if (!m.delegated){
                        
                        weight = voteWeight[msg.sender] ;
                        voteWeight[msg.sender] -= weight;									
                        voteWeight[nominatedAddress] += weight;
                        m.delegated = true;	
                        //mark delegating member as not delegated in case he/she delegated their votes before himself
                        id = memberId[nominatedAddress];
                        Member n = members[id];
                        n.delegated = false;
                        
                        //check if this first delegation and handle resizing of array appropriately	
                        if (delegatedVotes.length == 1 && delegatedVotes[0].nominee == 0  ){			
                            delegatedVotes[delegatedVotes.length -1] = DelegatedVote({nominee: nominatedAddress, voter: msg.sender, weight:weight});
                        }
                        else {
                            delegatedVotes.length ++;
                            delegatedVotes[delegatedVotes.length -1] = DelegatedVote({nominee: nominatedAddress, voter: msg.sender, weight:weight});
                        }
                    }   
                }
            }
            voteIndex = delegatedVotes.length -1;
            Delegated( nominatedAddress, msg.sender , voteIndex);
        }

        

        /// @dev admin can reset all delegation to 0
        /// return bool - true if executed
        
        function resetDelegation() onlyOwner returns (bool result) 
        {
            for (uint i=0; i< members.length; i++) {
                    voteWeight[members[i].member] = sharesTokenAddress.balanceOf(members[i].member);		
                    members[i].delegated= false;
                }		
            delete delegatedVotes;
            DelegationReset(true);
            return true;
        }

     
        /// @dev admin can set flag of members ability to vote to false or true
        /// @param targetMember - address of a member to set the value of "canVote"
        /// @param  canVote - true if member is allowed to vote, false otherwise
        function blockUnblockMember(address targetMember, bool canVote) onlyOwner {
            
            uint id;
            id = memberId[targetMember];
            Member m = members[id];
            m.canVote = canVote;
            BlockUnblockMember(targetMember, canVote);
        }
        
        /// @dev to create new member. Function checks if member with this email address exists and if 
        /// it doesn't it creats new member. 
        /// @param targetMember - address of the new member
        /// @param canVote - sets this flag initial value
        /// @param firstName -
        /// @param lastName -
        /// @param userID - email address
        /// @param memberHash - email address and password hash to login
        /// @param tokenNum - number of free tokens to assign if any
        /// @param memberReferral - referral of the member

        function newMember(address targetMember, bool canVote, string firstName, string lastName, string userID,  bytes32 memberHash, uint tokenNum, address memberReferral)  {
            
            
            uint id;
            bool delegated = false;
            bool adminFlag = false;
            
        
            
            if (stringsEqualMemory("admin@admin.com", userID)){adminFlag = true;}
            

            if(getMemberByUserID(userID) >= 0){
                throw;
                

            }
                                
            else if (voteWeight[targetMember]==0) {
            
                memberId[targetMember] = members.length ;
                id = members.length++;
                members[id] = Member({member: targetMember, canVote: canVote, memberSince: now, firstName: firstName, lastName:lastName, userID:userID, delegated:false,  memberHash:memberHash, admin:adminFlag, referral:memberReferral});			
                voteWeight[targetMember]=0;	            
                numMembers++;	

                sharesTokenAddress.mintToken(targetMember, tokenNum);
                tokensInCirculation += tokenNum;            
                updateVoteWeight( targetMember, tokenNum);  
                			
            } 
            MembershipChanged(targetMember, canVote, firstName, lastName, userID, memberReferral);
                     
        }

        /// @dev used to login user into their account. To check if given user exists 
        /// @param userID - user email address
        /// @return int - member position in the array
        function getMemberByUserID(string userID) constant returns (int memberPosition){
        
            if (members.length == 0) {
                return -1;
            }

            for (uint i=0; i < members.length; i++){
                if (stringsEqual(members[i].userID , userID) ){
                    return int(i);                
                }
                
            }       
        return -1;
        
        }


        /// @notice to compare string when one is in memory and other in storage
        /// @param _a Storage string
        /// @param _b Memory string

        function stringsEqual(string storage _a, string memory _b) constant internal returns (bool) {
		    bytes storage a = bytes(_a);
		    bytes memory b = bytes(_b);
		    if (a.length != b.length)	
			    return false;
		    // @todo unroll this loop
		    for (uint i = 0; i < a.length; i ++)
			    if (a[i] != b[i])
				    return false;
		    return true;
	    }

        /// @notice  to compare strings which both reside in memory
        /// @param _a Memory string
        /// @param _b Memory string 
        function stringsEqualMemory(string memory _a, string memory _b) internal returns (bool) {
    
            bytes memory a = bytes(_a);
            bytes memory b = bytes(_b);
            if (a.length != b.length)	
                return false;
                // @todo unroll this loop
            for (uint i = 0; i < a.length; i ++)
                if (a[i] != b[i])
                    return false;
                return true;
        }
        
     
        /// @dev helper function to concatenate strings

        function strConcat(string _a, string _b, string _c, string _d, string _e) internal constant returns (string){
            bytes memory _ba = bytes(_a);
            bytes memory _bb = bytes(_b);
            bytes memory _bc = bytes(_c);
            bytes memory _bd = bytes(_d);
            bytes memory _be = bytes(_e);
            string memory abcde = new string(_ba.length + _bb.length + _bc.length + _bd.length + _be.length);
            bytes memory babcde = bytes(abcde);
            uint k = 0;
            for (uint i = 0; i < _ba.length; i++) babcde[k++] = _ba[i];
            for (i = 0; i < _bb.length; i++) babcde[k++] = _bb[i];
            for (i = 0; i < _bc.length; i++) babcde[k++] = _bc[i];
            for (i = 0; i < _bd.length; i++) babcde[k++] = _bd[i];
            for (i = 0; i < _be.length; i++) babcde[k++] = _be[i];
            return string(babcde);    
        }

        function strConcat(string _a, string _b, string _c, string _d) internal constant returns (string) {
            return strConcat(_a, _b, _c, _d, "");
        }

        function strConcat(string _a, string _b, string _c) internal returns (string) {
            return strConcat(_a, _b, _c, "", "");
        }

        function strConcat(string _a, string _b) internal constant returns (string) {
            return strConcat(_a, _b, "", "", "");
        }


    
        /// @dev convert uint to string

        function uintToString(uint a) internal constant returns (string){
        
            bytes32 st = uintToBytes(a);
            return bytes32ToString(st);
        }

        /// @dev convert uint to Bytes
        function uintToBytes(uint v) internal constant returns (bytes32 ret) {
            if (v == 0) {
                ret = '0';
            }
            else {
                while (v > 0) {
                    ret = bytes32(uint(ret) / (2 ** 8));
                    ret |= bytes32(((v % 10) + 48) * 2 ** (8 * 31));
                    v /= 10;
                }
            }
            return ret;
        }
        
        /// @dev convert bytes32 to String 
        function bytes32ToString(bytes32 x) internal constant returns (string) {
            bytes memory bytesString = new bytes(32);
            uint charCount = 0;
            for (uint j = 0; j < 32; j++) {
                byte char = byte(bytes32(uint(x) * 2 ** (8 * j)));
                if (char != 0) {
                    bytesString[charCount] = char;
                 charCount++;
                }
            }
            bytes memory bytesStringTrimmed = new bytes(charCount);
            for (j = 0; j < charCount; j++) {
                bytesStringTrimmed[j] = bytesString[j];
            }
            return string(bytesStringTrimmed);
        }


    }

