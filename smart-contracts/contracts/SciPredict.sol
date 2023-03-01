// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.9;

//Import libraries
import "@uniswap/lib/contracts/libraries/TransferHelper.sol";
import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";
import "@chainlink/contracts/src/v0.8/ConfirmedOwner.sol";

//SciPredict contract
contract SciPredict is ChainlinkClient, ConfirmedOwner {
    //Set general variables
    address nullAddress = 0x0000000000000000000000000000000000000000;
    
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
    
    //Chainlink import
    using Chainlink for Chainlink.Request;
    bytes32 private jobId;
    uint256 private fee;
    uint private oraclePredictionId;

    //TODO UPDATE
    //Chainlink setting for multiple networks
    //Mainnet
    address chainLinkToken_mainnet = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address chainLinkOracle_mainnet = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;
    bytes32 jobId_mainnet = "c1c5e92880894eb6b27d3cae19670aa3";
    uint256 fee_mainnet = (1 * LINK_DIVISIBILITY) / 10;

    //Polygon 
    address chainLinkToken_polygon = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address chainLinkOracle_polygon = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;
    bytes32 jobId_polygon = "c1c5e92880894eb6b27d3cae19670aa3";
    uint256 fee_polygon = (1 * LINK_DIVISIBILITY) / 10;

    //Mantle
    address chainLinkToken_mantle = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address chainLinkOracle_mantle = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;
    bytes32 jobId_mantle = "c1c5e92880894eb6b27d3cae19670aa3";
    uint256 fee_mantle = (1 * LINK_DIVISIBILITY) / 10;

    //Scroll
    address chainLinkToken_scroll = 0x326C977E6efc84E512bB9C30f76E30c160eD06FB;
    address chainLinkOracle_scroll = 0xCC79157eb46F5624204f47AB42b3906cAA40eaB7;
    bytes32 jobId_scroll = "c1c5e92880894eb6b27d3cae19670aa3";
    uint256 fee_scroll = (1 * LINK_DIVISIBILITY) / 10;

    constructor() ConfirmedOwner(msg.sender) {
        uint256 chainId = retrieveChainId();
        //Mainnet
        if (chainId == 1){
            setChainlinkToken(chainLinkToken_mainnet);
            setChainlinkOracle(chainLinkOracle_mainnet);
            jobId = jobId_mainnet;
            fee = fee_mainnet;
        //Polygon mainnet
        } else if (chainId == 137){
            setChainlinkToken(chainLinkToken_polygon);
            setChainlinkOracle(chainLinkOracle_polygon);
            jobId = jobId_polygon;
            fee = fee_polygon;
        //Mantle testnet
        } else if (chainId == 5001){
            setChainlinkToken(chainLinkToken_mantle);
            setChainlinkOracle(chainLinkOracle_mantle);
            jobId = jobId_mantle;
            fee = fee_mantle;
        //Scroll testnet
        } else if (chainId == 534353){
            setChainlinkToken(chainLinkToken_scroll);
            setChainlinkOracle(chainLinkOracle_scroll);
            jobId = jobId_scroll;
            fee = fee_scroll;
        }
    }

    //Change chainlink oracle parameters - required for newer chains that have no chainlink yet
    function changeOracleParameters(address _chainLinkToken, address _chainLinkOracle, bytes32 _jobId, uint256 _fee) onlyOwner external {
        setChainlinkToken(_chainLinkToken);
        setChainlinkOracle(_chainLinkOracle);
        jobId = _jobId;
        fee = _fee; // 0,1 * 10**18 (Varies by network and job)
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
        
        //Check whether start capital adds up to reward
        // // Check whether buckets are empty
        // for (uint i = 0; i < zeroCommittedAmount.length; i++) {
        //     require(zeroCommittedAmount[i] == 0, "You must supply an empty array");
        // }
        
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
        } else{
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
        emit Bet(msg.sender, predictionId, scaledBet, msg.value);
    }

    // Get current quote for placing a bet
    function getCurrentQuote(uint predictionId, uint bucketIndex, uint proposedBet) public view returns(uint) {
        uint totalCommitted = getTotalCommitted(predictionId) + proposedBet;
        uint selectedBucketCommitted = predictionMarkets[predictionId].committedAmountBucket[bucketIndex] + proposedBet;
        uint currentQuote = (selectedBucketCommitted*100000) / totalCommitted;
        return currentQuote;
    }
    
    // Event to be emitted when user places bet
    event Bet(address indexed _user, uint predictionId, uint scaledBet, uint betAmount);

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

    // Get total amount committed for a given prediction
    function getTotalCommitted(uint predictionId) public view returns (uint) {
        uint totalCommitted = 0;
        for (uint i = 0; i < predictionMarkets[predictionId].committedAmountBucket.length; i++) {
            totalCommitted += predictionMarkets[predictionId].committedAmountBucket[i];
        }
        return totalCommitted;
    }

    // Allow a user to withdraw funds if they placed a correct bet
    function claimFunds(uint predictionId) public payable {
        // Funds must be claimed after prediction deadline
        require(block.timestamp >= predictionMarkets[predictionId].deadline, "The deadline has not yet passed");
        // Get index of bucket with correct outcome
        uint correctBucketIndex = getCorrectBucketIndex(predictionId);
        // Get bet placed by user on correct outcome
        uint correctOutcomeBet = betsMadePerBucket[predictionId][msg.sender][correctBucketIndex];
        // Bet must be greater than 0
        require(correctOutcomeBet != 0, "You did not place a correct bet");
        // Get total value of correct bets for bucket
        uint totalCorrectBet = predictionMarkets[predictionId].committedAmountBucket[correctBucketIndex];
        // Get total committed amount
        uint[] memory buckets = predictionMarkets[predictionId].committedAmountBucket;
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
        requestOutcomeData(predictionMarkets[predictionId].category_ApiEndpoint_PictureUrl[1]);
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