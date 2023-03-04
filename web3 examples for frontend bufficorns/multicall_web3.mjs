//Import packages
import {  Multicall} from 'ethereum-multicall';
import Web3 from 'web3';

// Define network addresses for multicall for mantle and scroll networks
const MANTLE_NETWORK_MULTICALL_CONTRACT_ADDRESS = '0x';
const SCROLL_NETWORK_MULTICALL_CONTRACT_ADDRESS = '0x';

//Returns multicall object
async function get_multi_call_provider(rpc_url){
   //Set provider to Tenderly :)
   const web3 = new Web3(rpc_url);
 
   // Get chain id
   const chain_id = await web3.eth.getChainId();
 
   //Mantle network
   if (chain_id == 5001){
     var multicall = new Multicall({
       web3Instance: web3,
       tryAggregate: true,
       multicallCustomContractAddress: MANTLE_NETWORK_MULTICALL_CONTRACT_ADDRESS,
     });
     
     // Scroll network
   } else if (chain_id == 534353){
     var multicall = new Multicall({
       web3Instance: web3,
       tryAggregate: true,
       multicallCustomContractAddress: SCROLL_NETWORK_MULTICALL_CONTRACT_ADDRESS,
     });
   } else{
     // Create a new Multicall instance
     var multicall = new Multicall({
       web3Instance: web3,
       tryAggregate: true,
     });
   }
   
   return multicall;
}
// Returns prediction market details
async function get_prediction_market_details(rpc_url, contract_address, abi, prediction_id) {
  // Get multicall object
  var multicall = await get_multi_call_provider(rpc_url);
  
  // Define the calls
  const contractCallContext = [
      {
          reference: 'contract',
          contractAddress: contract_address,
          abi: abi,
          calls: [
            // { reference: 'getLivePredictionIds', methodName: 'getLivePredictionIds', methodParameters: []},
            // { reference: 'predictionMarkets', methodName: 'predictionMarkets', methodParameters: [prediction_id] },
            { reference: 'predictionMarkets', methodName: 'viewPrediction', methodParameters: [prediction_id] },
            // { reference: 'getCurrentPrediction', methodName: 'getCurrentPrediction', methodParameters: [prediction_id] },
            // { reference: 'owner', methodName: 'owner', methodParameters: [] },
            // { reference: 'totalPredictions', methodName: 'totalPredictions', methodParameters: [] },
          ]
    },
  ];

  // Execute all calls in a single multicall
  const results = await multicall.call(contractCallContext);
  
  // Unpack all individual results
  var all_res = results.results.contract.callsReturnContext;
  var results_dict = {};
  for (const res of all_res) {
    var key = res['reference'];
    results_dict[key] = res['returnValues'];
  }

  // Requested variables
  var req_variables = {};
  req_variables['prediction_title'] = results_dict['predictionMarkets'][0];
  req_variables['unit'] = results_dict['predictionMarkets'][1];
  req_variables['prediction_bucket'] = results_dict['predictionMarkets'][2];
  req_variables['reward_amount'] = results_dict['predictionMarkets'][3];
  req_variables['reward_token'] = results_dict['predictionMarkets'][4];
  req_variables['incentive_curve'] = results_dict['predictionMarkets'][5];
  req_variables['permissioned'] = results_dict['predictionMarkets'][6];
  req_variables['deadline'] = results_dict['predictionMarkets'][7];
  req_variables['tags'] = results_dict['predictionMarkets'][8][0];
  req_variables['picture_url'] = results_dict['predictionMarkets'][8][2];
  req_variables['prediction_id'] = results_dict['predictionMarkets'][9];
  req_variables['creator_address'] = results_dict['predictionMarkets'][10];
  req_variables['outcome'] = results_dict['predictionMarkets'][11];
  req_variables['committed_amount_bucket'] = results_dict['predictionMarkets'][12];

  try{
    req_variables['current_prediction'] = results_dict['getCurrentPrediction'][0];
  }catch{
    req_variables['current_prediction'] = null;
  }

  return req_variables;
}

// Returns all live prediction markets
async function get_all_markets(rpc_url, contract_address, abi) {
    // Get multicall object
    var multicall = await get_multi_call_provider(rpc_url);
    
    // Define the first call
    var contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: [
              { reference: 'totalPredictions', methodName: 'totalPredictions', methodParameters: [] },
            ]
      },
    ];
  
    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);
    
    // Unpack all markets
    var call_list = []
    var total_predictions = results.results.contract.callsReturnContext[0]['returnValues'][0].hex;
    total_predictions = parseInt(total_predictions.toString(),16);

    const markets = Array.from(Array(total_predictions).keys())
    
    for (const pred_id of markets) {
      //Prepare second request
      call_list.push(
        { reference: 'viewPrediction_' + pred_id.toString(), methodName: 'viewPrediction', methodParameters: [pred_id] },
        { reference: 'getCurrentPrediction_' + pred_id.toString(), methodName: 'getCurrentPrediction', methodParameters: [pred_id] },
      )
    }

    // Define the second call
    contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: call_list
        },
    ];

    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);

    // Unpack all individual results
    var all_res = results.results.contract.callsReturnContext;
    var results_dict = {};
    for (const res of all_res) {
      var key = res['reference'];
      results_dict[key] = res['returnValues'];
    }
  
    // Requested variables
    var req_list = [];

    for (const pred_id of markets){
        var details_key = "viewPrediction_"+pred_id.toString();
        var prediction_key = "getCurrentPrediction_"+pred_id.toString();

        var res_dict = results_dict[details_key];
        var req_variables = {};
        req_variables['prediction_title'] = res_dict[0];
        req_variables['unit'] = res_dict[1];
        req_variables['prediction_bucket'] = res_dict[2];
        req_variables['reward_amount'] = res_dict[3];
        req_variables['reward_token'] = res_dict[4];
        req_variables['incentive_curve'] = res_dict[5];
        req_variables['permissioned'] = res_dict[6];
        req_variables['deadline'] = res_dict[7];
        req_variables['tags'] = res_dict[8][0];
        req_variables['picture_url'] = res_dict[8][2];
        req_variables['prediction_id'] = res_dict[9];
        req_variables['creator_address'] = res_dict[10];
        req_variables['outcome'] = res_dict[11];
        req_variables['committed_amount_bucket'] = res_dict[12];
      
        try{
            req_variables['current_prediction'] = results_dict[prediction_key][0];
          }catch{
            req_variables['current_prediction'] = null;
        }

        req_list.push(req_variables);
    }
    return req_list;
  }


// Returns all live prediction markets
async function get_all_live_markets(rpc_url, contract_address, abi) {
    // Get multicall object
    var multicall = await get_multi_call_provider(rpc_url);
    
    // Define the first call
    var contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: [
              { reference: 'getLivePredictionIds', methodName: 'getLivePredictionIds', methodParameters: [] },
            ]
      },
    ];
  
    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);
    
    // Unpack all live markets
    const live_markets = []
    var call_list = []
    var all_res = results.results.contract.callsReturnContext[0]['returnValues'];
    for (const res of all_res) {
      var pred_id = parseInt(res.hex.toString(),16);
      live_markets.push(pred_id);

      //Prepare second request
      call_list.push(
        { reference: 'viewPrediction_' + pred_id.toString(), methodName: 'viewPrediction', methodParameters: [pred_id] },
        { reference: 'getCurrentPrediction_' + pred_id.toString(), methodName: 'getCurrentPrediction', methodParameters: [pred_id] },
      )
    }

    // Define the second call
    contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: call_list
        },
    ];

    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);

    // Unpack all individual results
    var all_res = results.results.contract.callsReturnContext;
    var results_dict = {};
    for (const res of all_res) {
      var key = res['reference'];
      results_dict[key] = res['returnValues'];
    }
  
    // Requested variables
    var req_list = [];

    for (const pred_id of live_markets){
        var details_key = "viewPrediction_"+pred_id.toString();
        var prediction_key = "getCurrentPrediction_"+pred_id.toString();

        var res_dict = results_dict[details_key];
        var req_variables = {};
        req_variables['prediction_title'] = res_dict[0];
        req_variables['unit'] = res_dict[1];
        req_variables['prediction_bucket'] = res_dict[2];
        req_variables['reward_amount'] = res_dict[3];
        req_variables['reward_token'] = res_dict[4];
        req_variables['incentive_curve'] = res_dict[5];
        req_variables['permissioned'] = res_dict[6];
        req_variables['deadline'] = res_dict[7];
        req_variables['tags'] = res_dict[8][0];
        req_variables['picture_url'] = res_dict[8][2];
        req_variables['prediction_id'] = res_dict[9];
        req_variables['creator_address'] = res_dict[10];
        req_variables['outcome'] = res_dict[11];
        req_variables['committed_amount_bucket'] = res_dict[12];
      
        try{
            req_variables['current_prediction'] = results_dict[prediction_key][0];
          }catch{
            req_variables['current_prediction'] = null;
        }

        req_list.push(req_variables);
    }
    return req_list;
  }

//Get all user that bet per market
async function get_all_user_per_market(rpc_url, contract_address, abi, prediction_id){
    // Get multicall object
    var multicall = await get_multi_call_provider(rpc_url);
    
    // Define the first call
    var contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: [
              { reference: 'userPerMarketLength', methodName: 'userPerMarketLength', methodParameters: [prediction_id] },
            ]
      },
    ];
  
    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);
    
    // Unpack all markets
    var call_list = []
    var total_users = results.results.contract.callsReturnContext[0]['returnValues'][0].hex;
    total_users = parseInt(total_users.toString(),16);

    const users_list = Array.from(Array(total_users).keys())
    
    for (const user_id of users_list) {
        //Prepare second request
        call_list.push(
        { reference: 'getMarketUser' + user_id.toString(), methodName: 'getMarketUser', methodParameters: [prediction_id, user_id] }
        )
    }

    // Define the second call
    contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: call_list
        },
    ];
    
    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);

    var req_list = [];
    try{
        // Unpack all individual results
        var all_res = results.results.contract.callsReturnContext;
        for (const res of all_res) {
            req_list.push(res['returnValues'][0]);
        }
        return req_list;
    }catch{
        return req_list;
    }

}

// Returns all bets per bucket per user
async function get_all_bets_per_bucket_per_user(rpc_url, contract_address, abi, prediction_id, user_list) {
    // Get multicall object
    var multicall = await get_multi_call_provider(rpc_url);
    
      // Define the first call
    var contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: [
              { reference: 'getMarketBucketLenght', methodName: 'getMarketBucketLenght', methodParameters: [prediction_id] },
            ]
      },
    ];
  
    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);
    
    // Unpack hex
    var num_buckets = results.results.contract.callsReturnContext[0]['returnValues'][0].hex;
    num_buckets = parseInt(num_buckets.toString(),16);
  
    // Define the second call
    var call_list = []
    for (const user of user_list) {
      for (const bucket_index of Array.from(Array(num_buckets).keys())) {
        call_list.push(
          { reference: 'viewUserValuePerBucket_' + user + '_' + bucket_index, methodName: 'viewUserValuePerBucket', methodParameters: [prediction_id, user, bucket_index]},
        )
      }
    }
  
    var contractCallContext = [
        {
            reference: 'contract',
            contractAddress: contract_address,
            abi: abi,
            calls: call_list
      },
    ];
  
    // Execute all calls in a single multicall
    var results = await multicall.call(contractCallContext);
    
    // Unpack all individual results
    var all_res = results.results.contract.callsReturnContext;
    var results_dict = {};
    for (const res of all_res) {
      var key = res['reference'];
      results_dict[key] = res['returnValues'];
    }
  
    // Requested variables
    var req_dict = {}
    for (const user of user_list) {
      var committed_per_bucket = {}
      for (const bucket_index of Array.from(Array(num_buckets).keys())) {
        var res_key = 'viewUserValuePerBucket_' + user + '_' + bucket_index;
        var bucket_committed = parseInt(results_dict[res_key][0].hex,16);
        committed_per_bucket[bucket_index.toString()] = bucket_committed;
      }
      req_dict[user] = committed_per_bucket;
  
      }
  return req_dict
  }

// Get quote
async function get_quote(rpc_url, contract_address, abi, prediction_id, proposed_bet, bucket_index) {
  // Get multicall object
  var multicall = await get_multi_call_provider(rpc_url);
  // Define the calls
  const contractCallContext = [
      {
          reference: 'contract',
          contractAddress: contract_address,
          abi: abi,
          calls: [
            { reference: 'getCurrentQuote', methodName: 'getCurrentQuote', methodParameters: [prediction_id, bucket_index, proposed_bet] },
          ]
    },
  ];

  // Execute all calls in a single multicall
  const results = await multicall.call(contractCallContext);
  
  // Unpack all individual results
  var all_res = results.results.contract.callsReturnContext;
  var results_dict = {};
  for (const res of all_res) {
    var key = res['reference'];
    results_dict[key] = res['returnValues'];
  }

  // Requested variables
  var req_variables = {};
  req_variables['quote'] = results_dict['getCurrentQuote'][0];

  return req_variables;
}

// Is claimable
async function is_claimable(rpc_url, contract_address, abi, prediction_id, user) {
	// Get multicall object
	var multicall = await get_multi_call_provider(rpc_url);
	// Define the calls
	const contractCallContext = [
		{
			reference: 'contract',
			contractAddress: contract_address,
			abi: abi,
			calls: [
			  { reference: 'isClaimable', methodName: 'isClaimable', methodParameters: [prediction_id, user] },
			]
	  },
	];
  
	// Execute all calls in a single multicall
	const results = await multicall.call(contractCallContext);
	
	// Unpack all individual results
	var all_res = results.results.contract.callsReturnContext;
	var results_dict = {};
	for (const res of all_res) {
	  var key = res['reference'];
	  results_dict[key] = res['returnValues'];
	}
  
	return results_dict;
  }
  
// Is claimable via pool
async function is_claimable_pool(rpc_url, contract_address, abi, prediction_id, user) {
	// Get multicall object
	var multicall = await get_multi_call_provider(rpc_url);
	// Define the calls
	const contractCallContext = [
		{
			reference: 'contract',
			contractAddress: contract_address,
			abi: abi,
			calls: [
			  { reference: 'isClaimableViaPool', methodName: 'isClaimableViaPool', methodParameters: [prediction_id, user] },
			]
	  },
	];
  
	// Execute all calls in a single multicall
	const results = await multicall.call(contractCallContext);
	
	// Unpack all individual results
	var all_res = results.results.contract.callsReturnContext;
	var results_dict = {};
	for (const res of all_res) {
	  var key = res['reference'];
	  results_dict[key] = res['returnValues'];
	}
  
	return results_dict;
  }
  
// Get claimable amount
async function get_claimable_amount(rpc_url, contract_address, abi, prediction_id, user) {
	// Get multicall object
	var multicall = await get_multi_call_provider(rpc_url);
	// Define the calls
	const contractCallContext = [
		{
			reference: 'contract',
			contractAddress: contract_address,
			abi: abi,
			calls: [
			  { reference: 'getClaimableAmount', methodName: 'getClaimableAmount', methodParameters: [prediction_id, user] },
			]
	  },
	];
  
	// Execute all calls in a single multicall
	const results = await multicall.call(contractCallContext);
	
	// Unpack all individual results
	var all_res = results.results.contract.callsReturnContext;
	var results_dict = {};
	for (const res of all_res) {
	  var key = res['reference'];
	  results_dict[key] = res['returnValues'];
	}
  
	return results_dict;
  }
  
 // Get time passed
async function time_passed(rpc_url, contract_address, abi, prediction_id) {
	// Get multicall object
	var multicall = await get_multi_call_provider(rpc_url);
	// Define the calls
	const contractCallContext = [
		{
			reference: 'contract',
			contractAddress: contract_address,
			abi: abi,
			calls: [
			  { reference: 'timePassed', methodName: 'timePassed', methodParameters: [prediction_id] },
			]
	  },
	];
  
	// Execute all calls in a single multicall
	const results = await multicall.call(contractCallContext);
	
	// Unpack all individual results
	var all_res = results.results.contract.callsReturnContext;
	var results_dict = {};
	for (const res of all_res) {
	  var key = res['reference'];
	  results_dict[key] = res['returnValues'];
	}
  
	return results_dict;
  }
  
// Define the contract variables
const rpc_url = 'https://goerli.gateway.tenderly.co/3Ugz1n4IRjoidr766XDDxX';
var contract_address = '0xC9c037719B0E6aAB162c2dC932ff0ff2E72dc051';
var abi = [
	{
		"inputs": [],
		"name": "acceptOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "scaledBet",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			}
		],
		"name": "Bet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "ChainlinkCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "ChainlinkFulfilled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "ChainlinkRequested",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_chainLinkToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_chainLinkOracle",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_jobId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"name": "changeOracleParameters",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "claimFunds",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "closeMarket",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[]",
				"name": "newBuckets",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "createNewBuckets",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "predictionQuestion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "unit",
				"type": "string"
			},
			{
				"internalType": "uint256[]",
				"name": "predictionBucket",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "rewardToken",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "incentiveCurve",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "permissioned",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "apiEndpoint",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "picture_url",
				"type": "string"
			},
			{
				"internalType": "uint256[]",
				"name": "startCommittedAmount",
				"type": "uint256[]"
			}
		],
		"name": "createPrediction",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_requestId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_outcome",
				"type": "uint256"
			}
		],
		"name": "fulfill",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "apiEndpoint",
				"type": "string"
			}
		],
		"name": "requestOutcomeData",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "updateLivePredictionIds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "getCurrentPrediction",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "proposedBet",
				"type": "uint256"
			}
		],
		"name": "getCurrentQuote",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLivePredictionIds",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "getMarketBucketLenght",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getMarketUser",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "getTotalCommitted",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isWhitelisted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "predictionMarkets",
		"outputs": [
			{
				"internalType": "string",
				"name": "predictionQuestion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "unit",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "rewardToken",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "incentiveCurve",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "permissioned",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "market_owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "outcome",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retrieveChainId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalPredictions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "userPerMarketLength",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "viewPrediction",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "predictionQuestion",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "unit",
						"type": "string"
					},
					{
						"internalType": "uint256[]",
						"name": "predictionBucket",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256",
						"name": "rewardAmount",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "rewardToken",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "incentiveCurve",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "permissioned",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "deadline",
						"type": "uint256"
					},
					{
						"internalType": "string[3]",
						"name": "category_ApiEndpoint_PictureUrl",
						"type": "string[3]"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "market_owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "outcome",
						"type": "uint256"
					},
					{
						"internalType": "uint256[]",
						"name": "committedAmountBucket",
						"type": "uint256[]"
					}
				],
				"internalType": "struct SciPredict.predictionInstance",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			}
		],
		"name": "viewUserScaledBetsPerBucket",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			}
		],
		"name": "viewUserValuePerBucket",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
var prediction_id = 0;

var prediction_market_details = await get_prediction_market_details(rpc_url, contract_address, abi, prediction_id);
console.log(prediction_market_details)

// Current quote
const proposed_bet = 1e3.toString();
const bucket_index = 0;

var current_quote = await get_quote(rpc_url, contract_address, abi, prediction_id, proposed_bet, bucket_index);
console.log(current_quote);

// Get all prediction markets
var all_prediction_markets = await get_all_markets(rpc_url, contract_address, abi);
console.log(all_prediction_markets);

// Get all live prediction markets
var all_live_prediction_markets = await get_all_live_markets(rpc_url, contract_address, abi);
console.log(all_live_prediction_markets);

// Get all users for a prediction market
var user_list = await get_all_user_per_market(rpc_url, contract_address, abi, prediction_id);
console.log(user_list);

// Get all user bets for a prediction market
var all_bets_per_bucket_per_user = await get_all_bets_per_bucket_per_user(rpc_url, contract_address, abi, prediction_id, user_list);
console.log(all_bets_per_bucket_per_user);

// is claimable
var user = "0xdD9CECb2Ad144A32CbEB2dF7aEd229750C4e77Fc";
var is_claimable = await is_claimable(rpc_url, contract_address, abi, prediction_id, user);
console.log(is_claimable);

// is claimable via pool
var is_claimable_pool = await is_claimable_pool(rpc_url, contract_address, abi, prediction_id, user);
console.log(is_claimable_pool);

// Get claimable amount
var claimable_amount = await get_claimable_amount(rpc_url, contract_address, abi, prediction_id, user);
console.log(claimable_amount);

// Check is time expired
var is_time_passed = await time_passed(rpc_url, contract_address, abi, prediction_id);
console.log(is_time_passed);

// POOLING CONTRACT
var pooling_contract_address = '0xC9c037719B0E6aAB162c2dC932ff0ff2E72dc051';
var pooling_user = "0xdD9CECb2Ad144A32CbEB2dF7aEd229750C4e77Fc";
var pooling_abi = [
	{
		"inputs": [],
		"name": "acceptOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "_user",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "scaledBet",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "betAmount",
				"type": "uint256"
			}
		],
		"name": "Bet",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "ChainlinkCancelled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "ChainlinkFulfilled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "bytes32",
				"name": "id",
				"type": "bytes32"
			}
		],
		"name": "ChainlinkRequested",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_chainLinkToken",
				"type": "address"
			},
			{
				"internalType": "address",
				"name": "_chainLinkOracle",
				"type": "address"
			},
			{
				"internalType": "bytes32",
				"name": "_jobId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_fee",
				"type": "uint256"
			}
		],
		"name": "changeOracleParameters",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "claimFunds",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "closeMarket",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256[]",
				"name": "newBuckets",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "createNewBuckets",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "predictionQuestion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "unit",
				"type": "string"
			},
			{
				"internalType": "uint256[]",
				"name": "predictionBucket",
				"type": "uint256[]"
			},
			{
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "rewardToken",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "incentiveCurve",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "permissioned",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "string",
				"name": "category",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "apiEndpoint",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "picture_url",
				"type": "string"
			},
			{
				"internalType": "uint256[]",
				"name": "startCommittedAmount",
				"type": "uint256[]"
			}
		],
		"name": "createPrediction",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "bytes32",
				"name": "_requestId",
				"type": "bytes32"
			},
			{
				"internalType": "uint256",
				"name": "_outcome",
				"type": "uint256"
			}
		],
		"name": "fulfill",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferRequested",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "from",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			}
		],
		"name": "placeBet",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "apiEndpoint",
				"type": "string"
			}
		],
		"name": "requestOutcomeData",
		"outputs": [
			{
				"internalType": "bytes32",
				"name": "requestId",
				"type": "bytes32"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "to",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "updateLivePredictionIds",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "getCurrentPrediction",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "proposedBet",
				"type": "uint256"
			}
		],
		"name": "getCurrentQuote",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getLivePredictionIds",
		"outputs": [
			{
				"internalType": "uint256[]",
				"name": "",
				"type": "uint256[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "getMarketBucketLenght",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getMarketUser",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "getTotalCommitted",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "isWhitelisted",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "predictionMarkets",
		"outputs": [
			{
				"internalType": "string",
				"name": "predictionQuestion",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "unit",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "rewardAmount",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "rewardToken",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "incentiveCurve",
				"type": "string"
			},
			{
				"internalType": "bool",
				"name": "permissioned",
				"type": "bool"
			},
			{
				"internalType": "uint256",
				"name": "deadline",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "market_owner",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "outcome",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "retrieveChainId",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "totalPredictions",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "id",
				"type": "uint256"
			}
		],
		"name": "userPerMarketLength",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			}
		],
		"name": "viewPrediction",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "predictionQuestion",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "unit",
						"type": "string"
					},
					{
						"internalType": "uint256[]",
						"name": "predictionBucket",
						"type": "uint256[]"
					},
					{
						"internalType": "uint256",
						"name": "rewardAmount",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "rewardToken",
						"type": "address"
					},
					{
						"internalType": "string",
						"name": "incentiveCurve",
						"type": "string"
					},
					{
						"internalType": "bool",
						"name": "permissioned",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "deadline",
						"type": "uint256"
					},
					{
						"internalType": "string[3]",
						"name": "category_ApiEndpoint_PictureUrl",
						"type": "string[3]"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "market_owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "outcome",
						"type": "uint256"
					},
					{
						"internalType": "uint256[]",
						"name": "committedAmountBucket",
						"type": "uint256[]"
					}
				],
				"internalType": "struct SciPredict.predictionInstance",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			}
		],
		"name": "viewUserScaledBetsPerBucket",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "predictionId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "user",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "bucketIndex",
				"type": "uint256"
			}
		],
		"name": "viewUserValuePerBucket",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];
//TO ADD
//CHECK CONTRACT

// isClaimable X
// getclaimableAmount X
// isClaimableViaPool X
// ispassed


// POOLING
// ADDRESS + ABI
// isClaimable
// getclaimableAmount
// checkUserBet(address betAddress, uint predictionId, uint bucketIndex) 