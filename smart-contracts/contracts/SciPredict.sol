// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

contract SciPredict is ChainlinkClient, ConfirmedOwner {

    using Chainlink for Chainlink.Request;

    constructor() ConfirmedOwner(msg.sender) {
        setChainlinkToken(0x326C977E6efc84E512bB9C30f76E30c160eD06FB);
        setChainlinkOracle(0xCC79157eb46F5624204f47AB42b3906cAA40eaB7);
        jobId = "c1c5e92880894eb6b27d3cae19670aa3";
        fee = (1 * LINK_DIVISIBILITY) / 10; // 0,1 * 10**18 (Varies by network and job)
    }


    bytes32 private jobId;
    uint256 private fee;
    uint private oraclePredictionId;

    modifier onlyCreator(uint predictionId) {
        require(msg.sender == predictionMarkets[predictionId].owner);
        _;
    }

    //Prediction instance struct 
    struct predictionInstance {
        
        // Market creator input
        string predictionQuestion; // question 
        string unit; // unit 
        uint unitIncrement; // increment for adding prediction bucket - 1 / unitIncrement so 10 would be 0.1
        uint[] predictionBucket; // buckets for prediction
        uint rewardAmount; // reward amount - to be transferred from
        address rewardToken; // reward token address - if null address then native ETH is issued
        string incentiveCurve; // expontential, linear, or none
        bool permissioned;  // permission flag 
        uint deadline; // timestamp to end market in seconds since the epoch
        string[2] categoryApiEndpoint; // tags for market
        //string apiEndpoint; // api for getting outcome
        
        // Internal parameters
        uint id; // id of struct
        address owner; // market creator

        // Outcome variables
        //uint currentPrediction; // current prediction value
        uint outcome; // contains outcome upon completion
        uint[3] committedAmountBucket; // total commmitted amount per bucket 
    }

    // Prediction Mapping 
    // Map prediction id to metadata
    mapping(uint => predictionInstance) public predictionMarkets;
    // map prediction id to bets
    mapping(uint => mapping(address => mapping(uint => uint))) betsMade; // records participant bets


    // Number predictions
    uint predictionCounter = 0;
    uint[] livePredictions;

    address nullAddress = 0x0000000000000000000000000000000000000000;
    // TO DELTED
    // TEST:
    // "What"
    // 0
    // 10
    // [0,1,2]
    // 0
    // 0x0000000000000000000000000000000000000000
    // "exponential"
    // true
    // 1687308468
    // "test"

    function requestOutcomeData(string memory apiEndpoint) public returns (bytes32 requestId) {
        Chainlink.Request memory req = buildChainlinkRequest(
            jobId,
            address(this),
            this.fulfill.selector
        );

        req.add(
            "get",
            apiEndpoint
        );

        req.add(
            "path",
            "completed" // TODO change path depending upon api endpoint used
        );
        
        return sendChainlinkRequest(req, fee);
    }
    
    // Callback function upon fulfillment of request
    function fulfill (
        bytes32 _requestId,
        uint _outcome
    ) public recordChainlinkFulfillment(_requestId) {
        predictionMarkets[oraclePredictionId].outcome = _outcome;
    }

    // // Open a preliminary prediction
    function createPrediction(       
        string memory predictionQuestion, // question 
        string memory unit, // unit 
        uint unitIncrement, // increment for adding prediction bucket
        uint[] memory predictionBucket, // buckets for prediction
        uint rewardAmount, // reward amount - to be transferred from
        address rewardToken, // reward token address - if null address then native ETH is issued
        string memory incentiveCurve, // expontential, linear, or none
        bool permissioned,  // permission flag 
        uint deadline, // timestamp to end market in seconds since the epoch
        string memory category, // tags for market
        string memory apiEndpoint // api endpoint for oracle
        ) 
        payable public {
        
        //Calculate rewards and check if paid
        // Native ETH case
        if (msg.value != 0 && rewardToken == nullAddress){
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
        } else{
            revert("Reward token specification unclear.");
        }

        // Initialise dynamic array with zeros
        uint[3] memory committedAmount;

        // Init market
        predictionMarkets[predictionCounter] = predictionInstance(
            predictionQuestion, // question 
            unit, // unit 
            unitIncrement, // increment for adding prediction bucket
            predictionBucket, // buckets for prediction
            rewardAmount, // reward amount - to be transferred from
            rewardToken, // reward token address - if null address then native ETH is issued
            incentiveCurve, // expontential, linear, or none
            permissioned,  // permission flag 
            deadline, // timestamp to end market in seconds since the epoch
            [category, apiEndpoint], // tags for market
            //apiEndpoint, // api endpoint for outcome
            predictionCounter, // id of struct
            msg.sender, // owner
            //0, // current prediction value
            0, // sets outcome to placeholder of 0
            committedAmount // total commmitted amount per bucket
        );

        predictionCounter += 1;
    }

    // // Approve a preliminary market
    // function approvePrediction() {

    // }
    // View prediction
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
            // livePredictionCounter += 1;
          }
      }
    }

    // Get live prediction ids
    function getLivePredictionIds() public view returns(uint[] memory){
        return livePredictions;
    }


   // Whitelist check - TO IMPLEMENT CREDENTIALS CURRENTLY DUMMY
   function isWhitelisted() public view returns(bool) {
      return msg.sender == msg.sender;
   }
    // // Place a bet for a whitelisted user
    function placeBet(uint predictionId, uint bucketIndex) public payable {
        // Whitelist check
        require(isWhitelisted(), "User not whitelisted");
        require(block.timestamp < predictionMarkets[predictionId].deadline, "The prediction has ended");
        // Check transferred amounts - only native ETH
        require(msg.value > 0, "Amounts needs to surpass 0");
        // Add bet value to specified bucket
        predictionMarkets[predictionId].committedAmountBucket[bucketIndex] += msg.value;
        // Update participant's bet
        betsMade[predictionId][msg.sender][bucketIndex] += msg.value;
    }

    function getCurrentPrediction(uint predictionId) public view returns(uint){
        // TODO: Figure out units
        //       Use safemath library

        // Get market instance
        predictionInstance memory prediction = predictionMarkets[predictionId];
        
        // Calculate weighted average prediction
        uint totalCommittedFunds = 0;
        uint weightedValue = 0;
        for (uint i=0; i < prediction.predictionBucket.length; i++) {
            weightedValue += prediction.predictionBucket[i] * prediction.committedAmountBucket[i];
            totalCommittedFunds += prediction.committedAmountBucket[i];
        }

        return weightedValue/totalCommittedFunds;
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

    // Allow a user to withdraw funds if they placed a correct bet
    function claimFunds(uint predictionId) public payable {
        // Funds must be claimed after prediction deadline
        require(block.timestamp >= predictionMarkets[predictionId].deadline, "The deadline has not yet passed");
        // Get index of bucket with correct outcome
        uint correctBucketIndex = getCorrectBucketIndex(predictionId);
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMade[predictionId][msg.sender][correctBucketIndex];
        // Bet must be greater than 0
        require(correctOutcomeBet != 0, "You did not place a correct bet");
        // Get total value of correct bets for bucket
        uint totalCorrectBet = predictionMarkets[predictionId].committedAmountBucket[correctBucketIndex];
        // Get 
        uint[3] memory buckets = predictionMarkets[predictionId].committedAmountBucket;
        uint totalCommittedAmount = 0;
        for (uint i = 0; i < buckets.length; i++) {
            totalCommittedAmount += buckets[i];
        }
        uint awardAmount = correctOutcomeBet / totalCorrectBet * totalCommittedAmount;
        payable(msg.sender).transfer(awardAmount);
    }

    // Close a market
    function closeMarket(uint predictionId) public onlyCreator(predictionId) {
        require(block.timestamp >= predictionMarkets[predictionId].deadline, "Deadline has not yet passed");
        // Call the API endpoint to record outcome for prediction
        requestOutcomeData(predictionMarkets[predictionId].categoryApiEndpoint[1]);
        // Remove finished prediction from live predictions
        updateLivePredictionIds();
    }

    // Create new category
    function createNewBuckets(uint[] memory newBuckets, uint predictionId) public onlyCreator(predictionId) {
        predictionMarkets[predictionId].predictionBucket = newBuckets;
    }

}
