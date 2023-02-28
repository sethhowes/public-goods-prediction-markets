//Import packages
import {  Multicall} from 'ethereum-multicall';
import {ethers} from 'ethers';

// Define network addresses for multicall for mantle and scroll networks
const MANTLE_NETWORK_MULTICALL_CONTRACT_ADDRESS = '0x';
const SCROLL_NETWORK_MULTICALL_CONTRACT_ADDRESS = '0x';

//Returns multicall object
function get_multi_call_provider(rpc_url){
   //Set provider to Tenderly :)
   const provider = new ethers.providers.JsonRpcProvider(rpc_url);
 
   // Get chain id
   const chain_id = provider.getNetwork().chainId;
   console.log(chain_id);
 
   //Mantle network
   if (chain_id == 5001){
     var multicall = new Multicall({
       ethersProvider: provider,
       tryAggregate: true,
       multicallCustomContractAddress: MANTLE_NETWORK_MULTICALL_CONTRACT_ADDRESS,
     });
     
     // Scroll network
   } else if (chain_id == 534353){
     var multicall = new Multicall({
       ethersProvider: provider,
       tryAggregate: true,
       multicallCustomContractAddress: SCROLL_NETWORK_MULTICALL_CONTRACT_ADDRESS,
     });
   } else{
     // Create a new Multicall instance
     var multicall = new Multicall({
       ethersProvider: provider,
       tryAggregate: true,
     });
   }
   
   return multicall;
}
// Returns prediction market details
async function get_prediction_market_details(rpc_url, contract_address, abi, prediction_id) {
  // Get multicall object
  var multicall = get_multi_call_provider(rpc_url);
  
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
  req_variables['prediction_id'] = results_dict['predictionMarkets'][9];
  req_variables['creator_address'] = results_dict['predictionMarkets'][10];
  req_variables['outcome'] = results_dict['predictionMarkets'][11];
  req_variables['committed_amount_bucket'] = results_dict['predictionMarkets'][12];

  try{
    req_variables['getCurrentPrediction'] = results_dict['getCurrentPrediction'][0];
  }catch{
    req_variables['getCurrentPrediction'] = null;
  }

  return req_variables;
}

// Get quote
async function get_quote(rpc_url, contract_address, abi, prediction_id, proposed_bet, bucket_index) {
  // Get multicall object
  var multicall = get_multi_call_provider(rpc_url);
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
// Define the contract variables
const rpc_url = 'https://goerli.gateway.tenderly.co/3Ugz1n4IRjoidr766XDDxX';
var contract_address = '0x7de742F8baB59c668266D5a541fcd39f7D8DD598';
var abi = [
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
        "inputs": [],
        "name": "acceptOwnership",
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
            "internalType": "uint256[]",
            "name": "committedAmount",
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
            "name": "owner",
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
                "internalType": "string[2]",
                "name": "categoryApiEndpoint",
                "type": "string[2]"
              },
              {
                "internalType": "uint256",
                "name": "id",
                "type": "uint256"
              },
              {
                "internalType": "address",
                "name": "owner",
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
      }
    ];
var prediction_id = 0;

var prediction_market_details = await get_prediction_market_details(rpc_url, contract_address, abi, prediction_id);
console.log(prediction_market_details)

// Current quote
const proposed_bet = 1e18.toString();
const bucket_index = 0;

// getCurrentQuote(uint predictionId, uint bucketIndex, uint proposedBet)
var contract_address = '0x71C2468664b8c0c7d0ad0eA59C1fc1ddA15CDA7c';
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
				"internalType": "uint256",
				"name": "unitIncrement",
				"type": "uint256"
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
				"name": "unitIncrement",
				"type": "uint256"
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
				"name": "owner",
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
						"internalType": "uint256",
						"name": "unitIncrement",
						"type": "uint256"
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
						"internalType": "string[2]",
						"name": "categoryApiEndpoint",
						"type": "string[2]"
					},
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "owner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "outcome",
						"type": "uint256"
					},
					{
						"internalType": "uint256[3]",
						"name": "committedAmountBucket",
						"type": "uint256[3]"
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
			}
		],
		"name": "viewUserPrediction",
		"outputs": [],
		"stateMutability": "view",
		"type": "function"
	}
];
var current_quote = await get_quote(rpc_url, contract_address, abi, prediction_id, proposed_bet, bucket_index);
console.log(current_quote)