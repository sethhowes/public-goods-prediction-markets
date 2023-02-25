// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

import "https://github.com/Uniswap/solidity-lib/blob/master/contracts/libraries/TransferHelper.sol";

contract SciPredict {
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
        string category; // tags for market

        // Participants
        mapping(address => mapping(uint => uint)) betsMade; // records participant bets
        address[] participants; // records list of participants

        // Internal parameters
        uint id; // id of struct
        address owner; // market creator

        // Outcome variables
        uint currentPrediction; // current prediction value
        uint[] committedAmountBucket; // total commmitted amount per bucket 
    }

    // Prediction Mapping
    mapping(uint => predictionInstance) public predictionMarkets;

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
        string memory category // tags for market
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
        uint[] memory committedAmount;
        for (i = 0; i++; i =< predictionBucket.length) {
            committedAmount.push(0);
        }


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
            category, // tags for market
            predictionCounter, // id of struct
            0, // current prediction value
            committedAmount // total commmitted amount per bucket TODO: Make dynamic 0 array with length predictionBucket
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
   function isWhitelisted() public returns(bool) {
      return msg.sender == msg.sender;
   }
    // // Place a bet for a whitelisted user
    function placeBet(uint predictionId, uint bucketIndex) public payable {
        // Whitelist check
        require(isWhitelisted(), "User not whitelisted");

        //Check transferred amounts - only native ETH
        require(msg.value > 0, "Amounts needs to surpass 0");
        
        predictionMarkets[predictionId].committedAmountBucket[bucketIndex] += msg.value;
        
        // Update participant's bet
        predictionMarkets[predictionId][msg.sender][bucketIndex] += msg.value;

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

    // Allow a user to withdraw funds if they placed a correct bet
    function withdrawFunds(uint predictionId, uint correctBucketIndex) payable {
        uint correctOutcomeBet = predictionMarkets[predictionId][msg.owner][correctBucketIndex]
        require(correctOutcomeBet != 0, "You did not place a correct bet")
        uint totalCorrectBet = predictionMarkets[predictionId].committedAmountBucket[correctBucketIndex];
        uint awardAmount = correctOutcomeBet / totalCorrectBet * committedAmount;
        payable(msg.sender).transfer(awardAmount);
    }

    // // Close a market
    // function closeMarket() {

    // }

}