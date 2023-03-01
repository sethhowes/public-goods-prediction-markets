import React, { useEffect, useState } from "react";
import Meta from "components/Meta";
import DashboardSection2 from "components/DashboardSection2";
import Footer from "components/Footer";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Chart from "components/Chart"
import { PureComponent } from 'react';
import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, defs, linearGradient, stop  } from 'recharts';
import VotingComponent from "components/voting";
import Typography from "@mui/material/Typography";
import EnhancedTable from "components/Table"
import ColorTabs from "components/TabSection"
import CardStatsHorizontal from "components/CardStatistics";
import PeopleIcon from '@mui/icons-material/People';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import { makeStyles } from "@mui/styles";
import { requireAuth } from "util/auth";
import { usePredictionOnce } from "util/db";
import {get_prediction_market_details} from 'util/multicall.js'
import Web3 from 'web3';

const useStyles = makeStyles((theme) => ({
  gradientText: {
    backgroundClip: "text",
    backgroundImage:
      "linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
}));




function DashboardPage(props) {
  // url parsing  

  const web3 = new Web3();

const url = window.location.href;
const parts = url.split("?");
let prediction_id = 0;

prediction_id = parts[parts.length - 1]

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
const [predictionMarketDetails, setPredictionMarketDetails] = useState(null);
const [readableRewardAmount, setReadableRewardAmount] = useState(null);
const [readableDeadline, setReadableDeadline] = useState(null);
const [readablePredictionID, setReadablePredictionID] = useState(null);
const [readablePredictionOutcome, setReadablePredictionOutcome] = useState(null);
const [readableCommittedAmountBucket, setReadableCommittedAmountBucket] = useState(null);


useEffect(() => {
  async function fetchData() {

    const result = await get_prediction_market_details(rpc_url, contract_address, abi, prediction_id);
    setPredictionMarketDetails(result);
	// Convert reward_amount to a readable value
	setReadableRewardAmount(web3.utils.toHex(predictionMarketDetails?.reward_amount));
	// Convert deadline to a readable value (assuming it represents a Unix timestamp)
	if(predictionMarketDetails?.deadline){
		const readable_deadline = new Date(web3.utils.hexToNumber(predictionMarketDetails?.deadline?.hex) * 1000).toLocaleString();
	setReadableDeadline(readable_deadline);
	}
	// Convert prediction_id to a readable value

	setReadablePredictionID(web3.utils.toNumber(predictionMarketDetails?.prediction_id?.hex));
	// Convert outcome to a readable value

     setReadablePredictionOutcome(web3.utils.toNumber(predictionMarketDetails?.outcome?.hex));
	// Convert prediction_bucket to readable values
	setReadableCommittedAmountBucket(predictionMarketDetails?.committed_amount_bucket?.map(bucket => web3.utils.hexToNumber(bucket.hex)));

  } 
  
  fetchData();
}, []);
 
//setPredictionID(parts[parts.length - 1]);
console.log(predictionMarketDetails)

//Handle Big Number
// Convert prediction_bucket to readable values



/////////
  const classes = useStyles();


/*   const {
    data: prediction,
    status: predictionStatus,
    error: predictionError,
  } = usePredictionOnce(predictionID);
  console.log(predictionMarketDetails?.prediction_title) */
  //const predictionDetails = usePredictionOnce(predictionID)

// page information
  const predictionTitle = predictionMarketDetails?.prediction_title
  const options = predictionMarketDetails?.prediction_bucket?.map((bucket) => {
    if (predictionMarketDetails?.prediction_bucket.length === 2 && bucket.type === 'BigNumber' && (bucket.hex === '0x00' || bucket.hex === '0x01')) {
      return bucket.hex === '0x00' ? 'No' : 'Yes';
    } else {
      return parseInt(bucket.hex);
    }
  });
  const predictionCount = 47
  const predictionRewardAmount = web3.utils.toHex(predictionMarketDetails?.reward_amount)
  const predictionBucketPrices = [0.91, 0.07, 0.09]

//graph data
  const data = [
    {
      name: '2018',
      Temperature: 4
     
    },
    {
      name: '2019',
      Temperature: 2
    },
    {
      name: '2020',
      Temperature: 1
    },
    {
      name: '2021',
      Temperature: 2
    },
    {
      name: '2022',
      Temperature: 3
    },
    {
      name: '2023',
      Temperature: 4
     
    },
    {
      name: '2024',
      Temperature: 5
    
    },
  ];
  return (
    <> 
      <Meta title="Dashboard" />
      <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <SectionHeader
          title={props.title}
          subtitle={props.subtitle}
          size={4}
          sx={{ textAlign: "center" }}
        />

        
        <Grid container={true} spacing={4}>
          <Grid item={true} xs={12} md={8}>
          <Card>
              <CardContent sx={{  }}>
                <Box>
                <Typography component={'span'}sx={{ fontWeight: "bold", mb: 4, fontSize: 24}} className={classes.gradientText} align="left">{predictionTitle}</Typography>

                
                      <ComposedChart
                        width={700}
                        height={400}
                        data={data}
                        margin={{
                          top: 15,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                         <defs>
                         <linearGradient id="colorUv" x1="0%" y1="0%" x2="0%" y2="100%">
  <stop offset="0%" stopColor="#1EBEA5"/>
  <stop offset="100%" stopColor="rgba(255, 255, 255, 0)"/>
</linearGradient>
        </defs>
                        <CartesianGrid strokeDasharray="3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend legendType="line"/>
                        {/* <Area tooltipType="none" legendType="none" type="monotone" dataKey="temperature" stroke={false} strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" /> */}
                        <Line type="monotone" dataKey="Temperature" activeDot={{ r: 8 }}     stroke="#00B5C4"
 strokeWidth={3} />
                      </ComposedChart>
              
                </Box>
              </CardContent>
            </Card>
          </Grid>
          <Grid item={true} xs={12} md={4}>
            <Grid item mb={2}> 
            <Card>
              <CardContent sx={{ padding: 3 }}>
              <Box display="flex" alignItems="center">
              <AccountBalanceWalletIcon />

                <Typography  component={'span'} sx={{ fontWeight: 'bold', marginLeft: 2 }}>
                    <strong style={{ fontWeight: 'bold', padding: 3, ML: 5}}>Commited Capital:</strong>
                  </Typography>
                  <Typography  component={'span'} sx={{ fontWeight: 'bold', marginLeft: 2 }} className={classes.gradientText}>
                    {web3.utils.toNumber(predictionMarketDetails?.reward_amount.hex)} ETH
                  </Typography>
                </Box>
              </CardContent>
            </Card>
            </Grid>
            <Grid item mb={2}> 
            <Card>
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <Box display="flex" alignItems="center">
              <PeopleIcon />

                <Typography component={'span'}sx={{ fontWeight: 'bold', marginLeft: 2 }}>
                  <strong style={{ fontWeight: 'bold', padding: 3, ML: 5}}>Deadline:</strong>
                </Typography>
                <Typography component={'span'} sx={{ fontWeight: 'bold', marginLeft: 2 }} className={classes.gradientText}>
                  {readableDeadline}
                </Typography>
              </Box>
                            
                </Box>
              </CardContent>
            </Card>
          </Grid>
            <Grid item mb={4}> 
            <Card>
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <VotingComponent useStyles = {useStyles} options={options} predictionBucketPrices={predictionBucketPrices} />
              
                </Box>
              </CardContent>
            </Card>
            </Grid>
            
          </Grid>
          <Grid item={true} xs={12} md={12}>
            <Card>
              <CardContent sx={{ padding: 3 }}>
                <Box>
                  <ColorTabs useStyles = {useStyles} />
              
                </Box>
              </CardContent>
            </Card>
          </Grid>
          
        </Grid>
      </Container>
    </Section>
      
       
   
    </>

    
  );
}

export default requireAuth(DashboardPage);
