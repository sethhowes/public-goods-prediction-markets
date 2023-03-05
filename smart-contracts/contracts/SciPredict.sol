// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//Import libraries
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";


//ChainLink Consumer interface
interface IChainLinkConsumer {
    function getRequestId(uint predictionId) external view returns(bytes32);
    function getResult(bytes32 reqId) external view returns(bytes[] memory);
    function getResultViaPredId(uint predictionId) external view returns(bytes[] memory);
}

//SciPredict contract
contract SciPredict is ChainlinkClient, ConfirmedOwner {
    //Set general variables
    address nullAddress = 0x0000000000000000000000000000000000000000;
    address poolingContractInstance;
    address chainLinkFunctionConsumer;
    
    //Set pooling contract address
    function setPoolingContract(address poolingContract) public onlyOwner{
        poolingContractInstance = poolingContract;
    }

    //Get pooling contract address
    function getPoolingContract() public view returns(address){
        return poolingContractInstance;
    }

    //Set chainlink consumer address
    function setChainLinkFunctionConsumer(address chainLinkConsumer) public onlyOwner{
        chainLinkFunctionConsumer = chainLinkConsumer;
    }

    //Get chainlink consumer address
    function getChainLinkFunctionConsumer() public view returns(address){
        return chainLinkFunctionConsumer;
    }

    //Get chain id
    function retrieveChainId() public view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    //Only creator modifier
    modifier onlyCreator(uint predictionId) {
        require(msg.sender == predictionMarkets[predictionId].market_owner);
        _;
    }
    

    constructor() ConfirmedOwner(msg.sender) {
    }

    //Prediction instance struct 
    struct predictionInstance {
        // Market creator input
        string predictionQuestion; // question 
        string unit; // unit 
        uint[] predictionBucket; // buckets for prediction
        uint rewardAmount; // reward amount - to be transferred from
        address rewardToken; // reward token address - if null address then native ETH is issued
        string incentiveCurve; // expontential, linear, or none
        bool permissioned;  // permission flag 
        uint deadline; // timestamp to end market in seconds since the epoch
        string[3] category_ApiEndpoint_PictureUrl; // tags for market at [0] and api endpoint at [1]
        
        // Internal parameters
        uint id; // id of struct
        address market_owner; // market creator

        // Outcome variables
        //uint currentPrediction; // current prediction value
        uint outcome; // contains outcome upon completion
        uint[] committedAmountBucket; // total commmitted amount per bucket 
    }

    // Prediction Mapping 
    // Map prediction id to metadata
    mapping(uint => predictionInstance) public predictionMarkets;
    
    // Map prediction id to bets
    mapping(uint => mapping(address => mapping(uint => uint))) betsMadePerBucket;
    mapping(uint => mapping(address => mapping(uint => uint))) betsMadePerBucketValue;
    mapping(address => bool) poolingTracker;

    //Returns if reward is claimbale via pooling contract only
    function onlyClaimableViaPool(address user) public view returns(bool){
        return poolingTracker[user];
    }

    //Returns block.timestamp
    function getTimeStamp() public view returns(uint){
        return block.timestamp;
    }

    //Check deadline passed
    function timePassed(uint predictionId) public view returns(bool){
        return block.timestamp >= predictionMarkets[predictionId].deadline;
    }

    // User per market handling
    mapping(uint => address[]) userPerMarket;

    // Add item to user per market
    function addMarketUser(uint id, address _user) internal {
        userPerMarket[id].push(_user);
    }

    // Get item to user per market
    function getMarketUser(uint id, uint index) public view returns(address){
        return userPerMarket[id][index];
    }

    // Get user per market length
    function userPerMarketLength(uint id) public view returns(uint){
        return userPerMarket[id].length;
    }

    // Number predictions
    uint predictionCounter = 0;
    uint[] livePredictions;

    // Convert bytes uint
    function bytesToUint(bytes memory b) internal pure returns (uint256){
            uint256 number;
            for(uint i=0;i<b.length;i++){
                number = number + uint(uint8(b[i]))*(2**(8*(b.length-(i+1))));
            }
        return number;
    }

    // Full function oracle
    function fullfill_oracle(uint predictionId) public onlyOwner{
        bytes[] memory outcome = IChainLinkConsumer(chainLinkFunctionConsumer).getResultViaPredId(predictionId);
        
        uint outcome_int = bytesToUint(outcome[0]);
        predictionMarkets[predictionId].outcome = outcome_int;
        
        //Update outcome bucket
        setCorrectOutcomeBucket(predictionId);
    }

    //Override outcome for testing
    function overrideOutcome(uint predictionId, uint _outcome) public onlyOwner {
        //Set prediction outcome
        predictionMarkets[predictionId].outcome = _outcome;
        
        //Update outcome bucket
        setCorrectOutcomeBucket(predictionId);
    }

    // Open a prediction market
    function createPrediction(       
        string memory predictionQuestion, // question 
        string memory unit, // unit 
        // uint unitIncrement, // increment for adding prediction bucket
        uint[] memory predictionBucket, // buckets for prediction
        uint rewardAmount, // reward amount - to be transferred from
        address rewardToken, // reward token address - if null address then native ETH is issued
        string memory incentiveCurve, // expontential, linear, or none
        bool permissioned,  // permission flag 
        uint deadline, // timestamp to end market in seconds since the epoch
        string memory category, // tags for market
        string memory apiEndpoint, // api endpoint for oracle
        string memory picture_url, // api endpoint for oracle
        uint[] memory startCommittedAmount // empty array for bucket initialisation
        ) 
        payable public {
        
        //Calculate rewards and check if paid
        // Native ETH case
        if (rewardToken == nullAddress){
            rewardToken = nullAddress;
            rewardAmount = msg.value;
        } else if (msg.value == 0 && rewardToken != nullAddress){
            //Transfer ERC20 token
            TransferHelper.safeTransferFrom(
                rewardToken,
                msg.sender,
                address(this),
                rewardAmount
            );
        } else {
            revert("Reward token specification unclear.");
        }
        
        //Check whether start capital adds up to reward
        uint startAmounts = 0;
        for (uint i = 0; i < startCommittedAmount.length; i++) {
            startAmounts += startCommittedAmount[i];
        }
        require(startAmounts == rewardAmount, "Bucket start amounts do not equal reward amounts");

        // Init market
        predictionMarkets[predictionCounter] = predictionInstance(
            predictionQuestion, // question 
            unit, // unit 
            // unitIncrement, // increment for adding prediction bucket
            predictionBucket, // buckets for prediction
            rewardAmount, // reward amount - to be transferred from
            rewardToken, // reward token address - if null address then native ETH is issued
            incentiveCurve, // expontential, linear, or none
            permissioned,  // permission flag 
            deadline, // timestamp to end market in seconds since the epoch
            [category, apiEndpoint, picture_url], // tags for market
            predictionCounter, // id of struct
            msg.sender, // market_owner
            //0, // current prediction value
            0, // sets outcome to placeholder of 0
            startCommittedAmount // total commmitted amount per bucket
        );

        predictionCounter += 1;

        //Update live predictions
        updateLivePredictionIds();
    }

    // View number of predictions made
    function totalPredictions() public view returns(uint) {
        return predictionCounter;
    }

    // View prediction
    function viewPrediction(uint predictionId) public view returns(predictionInstance memory) {
        return predictionMarkets[predictionId];
    }

    // Update live predictions ids
    function updateLivePredictionIds() public {
      livePredictions = new uint[](0);
    //   uint livePredictionCounter = 0;
      for (uint i=0; i < predictionCounter; i++) {
          predictionInstance memory prediction = predictionMarkets[i];

          if (prediction.deadline > block.timestamp){
            livePredictions.push(prediction.id);
          }
      }
    }

    // Get live prediction ids
    function getLivePredictionIds() public view returns(uint[] memory){
        return livePredictions;
    }

    // Whitelist check - TODO IMPLEMENT CREDENTIALS CURRENTLY DUMMY
    function isWhitelisted() public view returns(bool) {
        return msg.sender == msg.sender;
    }
    	
    // Bet mapping
    mapping(uint => uint[]) public betAmounts;
    function viewBetAmounts(uint predictionId) public view returns (uint[] memory) {
        return betAmounts[predictionId];
    }
    // Timestamp mapping
    mapping(uint => uint[]) public betTimestamps;

    // Bucket mapping
    mapping(uint => uint[]) public betBuckets;
    
    function viewBetTimestamps(uint predictionId) public view returns (uint[] memory) {
        return betTimestamps[predictionId];
    }


    // Place a bet for a whitelisted user
    function placeBet(uint predictionId, uint bucketIndex) public payable {
        // Whitelist check
        require(isWhitelisted(), "User not whitelisted");

        // Deadline check
        require(block.timestamp < predictionMarkets[predictionId].deadline, "The prediction has ended");
        
        // Check transferred amounts - only native ETH
        require(msg.value > 0, "Amounts needs to surpass 0");
        uint totalCommitted = getTotalCommitted(predictionId) + msg.value;
        uint selectedBucketCommitted = predictionMarkets[predictionId].committedAmountBucket[bucketIndex] + msg.value;
        uint scaledBet = (msg.value * totalCommitted) / selectedBucketCommitted;
        
        // Add scaled bet to user
        betsMadePerBucket[predictionId][msg.sender][bucketIndex] += scaledBet;
        betsMadePerBucketValue[predictionId][msg.sender][bucketIndex] += msg.value;
        
        //Add user to market
        addMarketUser(predictionId, msg.sender);

        // Update amount committed to this bucket
        predictionMarkets[predictionId].committedAmountBucket[bucketIndex] += msg.value;
        
        // Emit bet event
        emit Bet(msg.sender, predictionId, scaledBet, msg.value, block.timestamp, bucketIndex);
        // Add bet amount to array
        betAmounts[predictionId].push(msg.value);
        // Add bet timestamp to array
        betTimestamps[predictionId].push(block.timestamp);
        // Add bet bucket to array
        betBuckets[predictionId].push(bucketIndex);
    }

    // Get bet bucket array
    function getBetBucketIndex(uint predictionId) public view returns(uint[] memory) {
        return betBuckets[predictionId];
    }

    // Place a bet via pool
    function placeBetViaPool(uint predictionId, uint bucketIndex) public payable {
        // Check if pooling contract is calling 
        require(msg.sender == poolingContractInstance, "Only pooling contract allowed");

        // Deadline check
        require(block.timestamp < predictionMarkets[predictionId].deadline, "The prediction has ended");
        
        // Check transferred amounts - only native ETH
        require(msg.value > 0, "Amounts needs to surpass 0");
        uint totalCommitted = getTotalCommitted(predictionId) + msg.value;
        uint selectedBucketCommitted = predictionMarkets[predictionId].committedAmountBucket[bucketIndex] + msg.value;
        uint scaledBet = (msg.value * totalCommitted) / selectedBucketCommitted;
        
        // Add scaled bet to user via tx.origin
        betsMadePerBucket[predictionId][tx.origin][bucketIndex] += scaledBet;
        betsMadePerBucketValue[predictionId][tx.origin][bucketIndex] += msg.value;
        
        // Update amount committed to this bucket
        predictionMarkets[predictionId].committedAmountBucket[bucketIndex] += msg.value;
        
        poolingTracker[tx.origin] = true;

        // Emit bet event
        emit Pooling(msg.sender, predictionId, scaledBet, msg.value, block.timestamp, bucketIndex);
    }


    // Get current quote for placing a bet
    function getCurrentQuote(uint predictionId, uint bucketIndex, uint proposedBet) public view returns(uint) {
        uint totalCommitted = getTotalCommitted(predictionId) + proposedBet;
        uint selectedBucketCommitted = predictionMarkets[predictionId].committedAmountBucket[bucketIndex] + proposedBet;
        uint currentQuote = (selectedBucketCommitted*100000) / totalCommitted;
        return currentQuote;
    }
    
    // Event to be emitted when user places bet
    event Bet(address indexed _user, uint indexed predictionId, uint scaledBet, uint betAmount, uint timeStamp, uint bucketIndex);
    event Pooling(address indexed _user, uint predictionId, uint scaledBet, uint betAmount, uint timeStamp, uint bucketIndex);

    // Get current prediction
    function getCurrentPrediction(uint predictionId) public view returns(uint) {
        // Get market instance
        predictionInstance memory prediction = predictionMarkets[predictionId];
        
        // Calculate weighted average prediction
        uint totalCommittedFunds = 0;
        uint weightedValue = 0;
        for (uint i=0; i < prediction.predictionBucket.length; i++) {
            weightedValue += prediction.predictionBucket[i] * prediction.committedAmountBucket[i];
            totalCommittedFunds += prediction.committedAmountBucket[i];
        }

        // Check denominator
        if (totalCommittedFunds != 0){
            return weightedValue/totalCommittedFunds;
        } else{
            return 0;
        }
    }

    // Gets the index for the correct outcome
    function getCorrectBucketIndex(uint predictionId) internal returns(uint) {
        uint outcome = predictionMarkets[predictionId].outcome;
        for (uint i = 0; i < predictionMarkets[predictionId].predictionBucket.length; i++) {
            if (predictionMarkets[predictionId].predictionBucket[i] == outcome) {
                return i;
            }
        }
    }

    mapping(uint => uint) correctBucketTracker; // predictionId to correct bucket mapping
 
    //Set correct outcome bucket
    function setCorrectOutcomeBucket(uint predictionId) internal{
        correctBucketTracker[predictionId] = getCorrectBucketIndex(predictionId);
    }

    // Get total amount committed for a given prediction
    function getTotalCommitted(uint predictionId) public view returns (uint) {
        uint totalCommitted = 0;
        for (uint i = 0; i < predictionMarkets[predictionId].committedAmountBucket.length; i++) {
            totalCommitted += predictionMarkets[predictionId].committedAmountBucket[i];
        }
        return totalCommitted;
    }

    //Check if claimable
    function isClaimable(uint predictionId, address user) public view returns(bool){
        // Funds must be claimed after prediction deadline
        if (block.timestamp < predictionMarkets[predictionId].deadline){
            return false;
        }

        // Get index of bucket with correct outcome
        uint correctBucketIndex = correctBucketTracker[predictionId];
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMadePerBucket[predictionId][user][correctBucketIndex];
        // Bet must be greater than 0
        if (correctOutcomeBet == 0){
            return false;
        }
        //Check if only claimable via pool
        if(onlyClaimableViaPool(user)==true){
            return false;
        }
        return true;
    }

    //Check if claimable via pool
    function isClaimableViaPool(uint predictionId, address user) public view returns(bool){
        // Funds must be claimed after prediction deadline
        if (block.timestamp < predictionMarkets[predictionId].deadline){
            return false;
        }
        // Get index of bucket with correct outcome
        uint correctBucketIndex = correctBucketTracker[predictionId];
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMadePerBucket[predictionId][user][correctBucketIndex];
        // Bet must be greater than 0
        if (correctOutcomeBet == 0){
            return false;
        }
        return true;
    }

    //Get claimable amount
    function getClaimableAmount(uint predictionId, address user) public view returns(uint){
        // Get index of bucket with correct outcome
        uint correctBucketIndex = correctBucketTracker[predictionId];
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMadePerBucket[predictionId][user][correctBucketIndex];

        // Get total value of correct bets for bucket
        uint totalCorrectBet = predictionMarkets[predictionId].committedAmountBucket[correctBucketIndex];
        // Get total committed amount
        uint[] memory buckets = predictionMarkets[predictionId].committedAmountBucket;
        uint totalCommittedAmount = 0;
        for (uint i = 0; i < buckets.length; i++) {
            totalCommittedAmount += buckets[i];
        }
        uint awardAmount = correctOutcomeBet * totalCommittedAmount / totalCorrectBet;

        return awardAmount;
    }

    //Get total committed amount
    function getTotalCommittedAmount(uint predictionId) public view returns(uint){
        // Get index of bucket with correct outcome
        uint correctBucketIndex = correctBucketTracker[predictionId];

        // Get total committed amount
        uint[] memory buckets = predictionMarkets[predictionId].committedAmountBucket;
        uint totalCommittedAmount = 0;
        for (uint i = 0; i < buckets.length; i++) {
            totalCommittedAmount += buckets[i];
        }

        return totalCommittedAmount;
    }

    //Get betting amounts
    function getBettingAmounts(uint predictionId, address user) public view returns(uint[2] memory){
        // Get index of bucket with correct outcome
        uint correctBucketIndex = correctBucketTracker[predictionId];
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMadePerBucket[predictionId][user][correctBucketIndex];

        // Get total value of correct bets for bucket
        uint totalCorrectBet = predictionMarkets[predictionId].committedAmountBucket[correctBucketIndex];

        return [correctOutcomeBet, totalCorrectBet];
    }

    // Allow a user to withdraw funds if they placed a correct bet
    function claimFunds(uint predictionId) public payable {
        //Claimable handling
        if (msg.sender == poolingContractInstance){
            //Check if funds are only claimable via pooling contract
            require(onlyClaimableViaPool(msg.sender)==false, "Only claimable via pooling contract");
        } else{
            //Check if claimable
            require(isClaimable(predictionId, msg.sender),"Not claimable");
        }

        // Get index of bucket with correct outcome
        uint correctBucketIndex = getCorrectBucketIndex(predictionId);
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMadePerBucket[predictionId][msg.sender][correctBucketIndex];
        
        // Get total value of correct bets for bucket
        uint totalCorrectBet = predictionMarkets[predictionId].committedAmountBucket[correctBucketIndex];
        // Get total committed amount
        uint[] memory buckets = predictionMarkets[predictionId].committedAmountBucket;
        uint totalCommittedAmount = 0;
        for (uint i = 0; i < buckets.length; i++) {
            totalCommittedAmount += buckets[i];
        }
        uint awardAmount = correctOutcomeBet * totalCommittedAmount / totalCorrectBet;
        payable(msg.sender).transfer(awardAmount);
    }

    // Close a market
    function closeMarket(uint predictionId) public payable onlyCreator(predictionId) {
        require(block.timestamp >= predictionMarkets[predictionId].deadline, "Deadline has not yet passed");
        // Fullfil oracle
        fullfill_oracle(predictionId);
        // Remove finished prediction from live predictions
        updateLivePredictionIds();
    }

    //View value per bets
    function viewUserValuePerBucket(uint predictionId, address user, uint bucketIndex) public view returns(uint) {
        return betsMadePerBucketValue[predictionId][user][bucketIndex];
    }

    //View value per bets
    function getMarketBucketLenght(uint predictionId) public view returns(uint) {
        return predictionMarkets[predictionId].predictionBucket.length;
    }

    //View scaled bets
    function viewUserScaledBetsPerBucket(uint predictionId, address user, uint bucketIndex) public view returns(uint) {
        return betsMadePerBucket[predictionId][user][bucketIndex];
    }

    // Create new category
    function createNewBuckets(uint[] memory newBuckets, uint predictionId) public onlyCreator(predictionId) {
        uint[] memory prevBuckets = predictionMarkets[predictionId].predictionBucket;

        //Compare arrays and check if all previous values are included in the new buckets
        for (uint i = 0; i < prevBuckets.length; i++) {
            bool prevInNew = false;
            for (uint j = 0; j < newBuckets.length; j++) {
                if (newBuckets[j] == prevBuckets[i]){
                    prevInNew = true;
                }
            }
            require(prevInNew == true, "New buckets need to contain old ones");
        }

        predictionMarkets[predictionId].predictionBucket = newBuckets;
    }
}