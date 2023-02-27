//Import packages
import {  Multicall} from 'ethereum-multicall';
import {ethers} from 'ethers';

async function main() {
  //Set provider to Tenderly :)
  const provider = new ethers.providers.JsonRpcProvider('https://goerli.gateway.tenderly.co/3Ugz1n4IRjoidr766XDDxX');

  // Define network addresses
  const MANTLE_NETWORK_MULTICALL_CONTRACT_ADDRESS = '0x';
  const SCROLL_NETWORK_MULTICALL_CONTRACT_ADDRESS = '0x';

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

  // Define the contract variables
  const address = '0x7de742F8baB59c668266D5a541fcd39f7D8DD598';
  const abi = [
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

  // Define the calls
  const contractCallContext = [
      {
          reference: 'SciPredict',
          contractAddress: address,
          abi: abi,
          calls: [
            { reference: 'getLivePredictionIds', methodName: 'getLivePredictionIds', methodParameters: []},
            { reference: 'predictionMarkets', methodName: 'predictionMarkets', methodParameters: [prediction_id] },
            { reference: 'getCurrentPrediction', methodName: 'getCurrentPrediction', methodParameters: [prediction_id] },
            { reference: 'owner', methodName: 'owner', methodParameters: [] },
            { reference: 'totalPredictions', methodName: 'totalPredictions', methodParameters: [] },
            { reference: 'viewPrediction', methodName: 'viewPrediction', methodParameters: [prediction_id] },
          ]
    },
  ];

  // Execute all calls in a single multicall
  const results = await multicall.call(contractCallContext);
  
  // Unpack all individual results
  var all_res = results.results.SciPredict.callsReturnContext;
  var results_dict = {};
  for (const res of all_res) {
    console.log(res);
    var key = res['reference'];
    results_dict[key] = res['returnValues'];
  }
  console.log(results_dict);

}

await main();