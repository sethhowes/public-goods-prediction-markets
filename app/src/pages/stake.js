import React from "react";
import { useRouter } from "next/router";
import Meta from "components/Meta";
import { useState } from "react";

import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useEffect } from "react";
import { makeStyles } from "@mui/styles";
import { Typography, Chip } from "@mui/material";
import Web3 from 'web3';
import { abi, contract, contract_address, rpc_url, polygon_rpc_url, polygon_contract_address} from 'util/contract.js'
import { useNetwork } from 'wagmi'
import {get_all_markets} from 'util/multicall.js'
import {get_all_user_per_market, get_all_bets_per_bucket_per_user} from 'util/multicall.js'

import StakingTable from "components/StakingTable";

const useStyles = makeStyles((theme) => ({
  
  priceChip: {
    backgroundColor: '#4caf50', 
    color: '#fff', 
  },
  gradientText: {
    backgroundClip: "text",
    backgroundImage:
      "linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  toolbarContainer: {
    "& .MuiButton-root": {
      color: theme.palette.secondary.main,
    },
  },
}));

  function DashboardPage(props) {

    
    const { chain, chains } = useNetwork();
    const [rpc_address, setrpc_address] = useState(rpc_url)
    const [contractAddress, setcontractAddress] = useState(contract_address)
    useEffect(() => {
      
      if (chain?.name === "Goerli") {
        setrpc_address(rpc_url)
        setcontractAddress(contract_address)
        console.log('Ethereum')
      } else{
        setrpc_address(polygon_rpc_url)
        setcontractAddress(polygon_contract_address)
    
          console.log('Polygon')
        }
      },[chain?.name])
    const [markets, setMarkets] = useState([]);
    const [userList, setUserList] = useState([]);
    const [resultsUsersBets, setResultsUsersBets] = useState([]);


useEffect(() => {
  const processMarkets = async () => {
    const allUserList = [];
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      const userList = await get_all_user_per_market(rpc_address, contractAddress, abi, market.prediction_id);
      userList.forEach((userAddress) => {
        if (!allUserList.includes(userAddress)) {
          allUserList.push(userAddress);
        }
      });
    }
    setUserList(allUserList);
  };

  processMarkets().then((allUserList) => {
    console.log(allUserList);
  });
}, [markets]);


useEffect(() => {
  
  async function fetchBets() {
    let results = [];
    for (let i = 0; i < markets.length; i++) {
      const market = markets[i];
      const bets = await get_all_bets_per_bucket_per_user(rpc_address, contractAddress, abi, market.prediction_id, userList);
      results.push(bets); // add the bets to the results array
    }
    setResultsUsersBets(results);
  }

  if (markets.length > 0 && userList.length > 0) { // check if either array is empty before executing
    fetchBets();
  }
}, [markets, userList, rpc_address, contractAddress, abi, setResultsUsersBets]);

let votes = resultsUsersBets
console.log('votes', resultsUsersBets)

console.log('users', userList)

    useEffect(() => {
      async function fetchData() {
    
        const result = await get_all_markets(rpc_address, contractAddress, abi);
        setMarkets(result);
    
      } 
      
      fetchData();
    }, []);
    const web3 = new Web3();

    const router = useRouter();

    const handleRowClick = () => {
    
      router.push('/dashboard');}
  
  const [value, setValue] = useState('all')
  const [searchText, setSearchText] = useState("Frog");
  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }
 
  
  const rows = userList.map((address, index) => {
    return { id: index + 1, address };
  });
  
  const classes = useStyles();
  const columns = [
    {
      flex: 0.4,
      minWidth: 100,
      field: 'address',
      headerName: 'Address',
      renderCell: ({ row }) =>  <Typography sx={{ fontWeight: 'bold'}} className={classes.gradientText} variant='body2'>{row.prediction}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'category',
      headerName: 'Category',
      renderCell: ({ row }) =>  <Typography variant='body2'>{row.category}</Typography>
    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'consensus',
      headerName: 'Consensus',
      renderCell: ({ row }) => (
        <Chip label={`${row.consensus}`} className={classes.priceChip} />
      )    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'price',
      headerName: 'Consensus Price',
      renderCell: ({ row }) => (
        <Chip
          label={`$${row.price}`}
          color="secondary"
          size="small"
          sx={{ fontWeight: "bold" }}
        />
      )    },
    {
      flex: 0.1,
      minWidth: 100,
      field: 'predictors',
      headerName: 'Predictors',
      renderCell: ({ row }) =>  <Typography variant='body2'>{row.predictors}</Typography>
    }
  
  ]
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
        <Grid item={true} xs={12} md={3}>
        <Card>
                  <CardContent sx={{ padding: 3 }}>
                  <Typography sx={{ fontWeight: 'bold'}} className={classes.gradientText} variant='h5'>Staking</Typography>
                  <Typography>Earn yield by staking your tokens in academics.</Typography>
                  </CardContent>
          </Card>
          </Grid>
          <Grid item={true} xs={12} md={3}>
        <Card>
          
                        <CardContent sx={{ padding: 3 }}>
                        <Container>
             <Grid container={true} justifyContent="center" >
            <Grid item={true} mt={3} mb={2} xs={12} sm={3}>
          

              <Box sx={{ textAlign: "center" }}>

                <Typography sx={{ fontWeight: "bold"}} className={classes.gradientText} variant="h4">{markets.length}</Typography>
                <Typography  ml={-2} variant="overline">Predictions</Typography>
              </Box>
            </Grid>
           </Grid>
           </Container>
              </CardContent>
          </Card>
          </Grid>
          <Grid item={true} xs={12} md={3}>
                <Card>
                      <CardContent sx={{ padding: 3 }}>
                      <Container>
                    <Grid container={true} justifyContent="center" >
                    <Grid item={true} mt={3} mb={2} xs={12} sm={3}>

                      <Box sx={{ textAlign: "center" }}>

                        <Typography  sx={{ fontWeight: "bold"}} className={classes.gradientText} variant="h4">{userList.length}</Typography>
                        <Typography  ml={0} variant="overline">Users</Typography>

                      </Box>
                    </Grid>
                  </Grid>
                  </Container>
                      </CardContent>
                  </Card>
          </Grid>
          <Grid item={true} xs={12} md={3}>
          <Card>
                      <CardContent sx={{ padding: 3 }}>
                      <Container>
                    <Grid container={true} justifyContent="center" >
                    <Grid item={true} mt={3} mb={2} xs={12} sm={3}>
                    

                      <Box sx={{ textAlign: "center" }}>

                        <Typography  sx={{ fontWeight: "bold"}} className={classes.gradientText} variant="h4">0</Typography>
                        <Typography  ml={0} variant="overline">Bets</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                  </Container>
                      </CardContent>
                  </Card>
          </Grid>
         
        
          
          <Grid item={true} xs={12} md={12}>
          <Card>
          
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <Typography  sx={{ fontWeight: "bold"}} mb={5} className={classes.gradientText} variant="h5" align="left">Follow the Cognoscenti</Typography>

                <div style={{ width: "100%" }}>
                <StakingTable betsList = {resultsUsersBets} userList = {userList} />
             
                  </div>
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

export default DashboardPage;





