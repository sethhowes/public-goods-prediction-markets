// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//Import libraries
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

interface ISciPredict {
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

    function totalPredictions()  external view returns(uint);
    function viewPrediction(uint predictionId) external view returns(predictionInstance memory);
    function getLivePredictionIds() external view returns(uint[] memory);
    function placeBet(uint predictionId, uint bucketIndex) external payable;
    function getCurrentQuote(uint predictionId, uint bucketIndex, uint proposedBet) external view returns(uint);
    function getTotalCommitted(uint predictionId) external view returns (uint);
    function viewUserValuePerBucket(uint predictionId, address user, uint bucketIndex) external view returns(uint);
    function placeBetViaPool(uint predictionId, uint bucketIndex) external payable;
    function claimFunds(uint predictionId) external payable;
}

//SciPredict contract
contract predictPooling is ConfirmedOwner {
    // address predictContractInstance;
    address predictContractInstance;
    uint copyFee;

    constructor() ConfirmedOwner(msg.sender){

    }

    //Set predict contract address
    function setPredictContract(address predictContract) public onlyOwner{
        predictContractInstance = predictContract;
    }

    //Set predict contract address
    function setCopyFees(uint _copyFee) public onlyOwner{
        copyFee = _copyFee;
    }

    // Check user bet
    function checkUserBet(address betAddress, uint predictionId, uint bucketIndex) public view returns(uint){
        //Check if bet from bet address exist
        uint userBet = ISciPredict(predictContractInstance).viewUserValuePerBucket(predictionId, betAddress, bucketIndex);
        return userBet;
    }

    //Copy address in betting
    function copyBet(address betAddress, uint predictionId, uint bucketIndex) public payable{
        //Check msg.value
        require(msg.value > 0, "Bet value must be greater than 0");
    
        //Check if bet from bet address exist
        uint userBet = checkUserBet(betAddress, predictionId, bucketIndex);

        require(userBet != 0, "User did not bet so cannot copy bet");

        //Place bet via pooling
        ISciPredict(predictContractInstance).placeBetViaPool{value: msg.value}(predictionId, bucketIndex);

    }

    //Claim copied bet - part of the fees goes towards copied betAddress
    function claimReward(uint predictionId){
        //Claim rewards 
        ISciPredict(predictContractInstance).claimFunds(uint predictionId);

        //Somehow make sure that copied bets can only be claimed via this contract
        //TAKE FEE
        //ADD FUNCTION TO CHECK IF REWARD IS CLAIMABLE
        // Run balance checker in main contract X

    }
}