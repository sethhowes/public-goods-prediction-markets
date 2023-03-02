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
    function isClaimableViaPool(uint predictionId) external view returns(bool);
    function getClaimableAmount(uint predictionId) external view returns(uint);
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

    //Get predict contract address
    function getPredictContract() public view returns(address){
        return predictContractInstance;
    }

    //Set copyfee
    function setCopyFees(uint _copyFee) public onlyOwner{
        copyFee = _copyFee;
    }

    //Get copyfee
    function getCopyFees() public view returns(uint){
        return copyFee;
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

    //Check if claimable
    function isClaimable(uint predictionId) public view returns(bool){
        return ISciPredict(predictContractInstance).isClaimableViaPool(predictionId);
    }

    //Get claimable amount
    function getClaimableAmount(uint predictionId) public view returns(uint){
        return ISciPredict(predictContractInstance).getClaimableAmount(predictionId);
    }

    //Claim copied bet - part of the fees goes towards copied betAddress
    function claimReward(uint predictionId) public payable{
        //Check if claimable
        require(isClaimable(predictionId), "Nothing claimable");
        
        // Start balance
        uint startBalance = address(this).balance;
        
        //Claim rewards 
        ISciPredict(predictContractInstance).claimFunds(predictionId);

        uint endBalance = address(this).balance;

        // Calculate payout for copy better
        uint rewardAmountNet = (endBalance - startBalance) * copyFee / 10000;
        
        // Send reward net of fees to claimer
        address payable destAddress = payable(msg.sender);
        destAddress.transfer(rewardAmountNet);

        // TODO Implement payoff to copied address
        // uint balanceAfterReward = address(this).balance;
        // uint rewardFees = (balanceAfterReward - startBalance);

        // Send fees to copied better
        // address copiedBetter = 0x0000000000000000000000000000000000000000;
        // address payable destAddressFees = payable(copiedBetter);
        // destAddressFees.transfer(rewardFees);
    }

    //Withdraw ether
    function withdrawFunds() onlyOwner payable public {
        address payable destAddress = payable(msg.sender);
        destAddress.transfer(address(this).balance);
    }
    
}