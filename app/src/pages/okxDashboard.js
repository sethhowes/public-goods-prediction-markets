import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Meta from "components/Meta";
import DashboardSection2 from "components/DashboardSection2";
import Navbar2 from "components/Navbar2";
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
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PredictionData from "components/predictionData";
import PredictionMeta from "components/predictionMeta"
import { makeStyles } from "@mui/styles";
import { DataGrid, GridToolbarContainer, GridToolbar, selectedGridRowsSelector } from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import { Typography, Chip } from "@mui/material";
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Avatar from '@mui/material/Avatar'
import { requireAuth } from "util/auth";
import {get_all_markets} from 'util/multicall.js'
import Web3 from 'web3';
const { toDateTime } = require('web3-utils');
import {rpc_url, contract_address, abi} from 'util/contract.js'
import { useNetwork } from 'wagmi'

// Define the contract variables


/* let rows = [
  { id: 1, prediction: "What will be the global average temperature in 2042?", category: "climate", consensus: 25, price: 0.98, predictors: 22 },
  { id: 2, prediction: "What will the inflation rate be in 2027?", category: "finance", consensus: "4%", price: 0.20, predictors: 22 },
  { id: 3, prediction: "What decade will we achieve AGI?", category: "risks", consensus: "2040s", price: 0.68, predictors: 22 },
  ]; */
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
}))
  function DashboardPage(props) {

    const [pending, setPending] = useState(false);
    const [resJson, setResJson] = useState(null);
//
function fetchData() {
  fetch(`https://cognoscenticrypto.herokuapp.com/okx_dashboard`, {
    method: 'GET'
  })
  .then(res => res.json())
  .then(resJson => {
    setResJson(resJson)
    setPending(true)
    console.log(resJson)
  })
  .catch(err => {
    // handle error here
  })
}
fetchData() 
console.log(resJson)


///
const web3 = new Web3();
const [rows, setRows] = useState([]);

const [allPredictionMarkets, setAllPredictionMarkets] = useState(null);

//setPredictionID(parts[parts.length - 1]);

    const router = useRouter();

    const handleRowClick = (prediction_id) => {
      router.push(`/dashboard?${prediction_id}`);
    };
  const [value, setValue] = useState('all')
  const [searchText, setSearchText] = useState("Frog");
  const handleSearchTextChange = (event) => {
    setSearchText(event.target.value);
  };
  const handleChange = (event, newValue) => {
    setValue(newValue)
  }

  const { chain, chains } = useNetwork()

  const RenderTabAvatar = ({ category }) => (
    <Avatar
      variant='rounded'
      sx={{
        width: 100,
        height: 92,
        backgroundColor: 'transparent',
        border: theme =>
          value === category ? `2px solid ${theme.palette.primary.main}` : `2px dashed ${theme.palette.divider}`
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
        <img
          width={34}
          height={34}
          alt={`tabs-${category}`}
          src={`/images/${category}.svg`}
        />
        <Typography className={classes.gradientText} variant='body2' sx={{ mt: 2, fontWeight: 600, textTransform: 'capitalize' }}>
          {category}
        </Typography>
      </Box>
    </Avatar>
  )
   const getFilteredRows = () => {
    if (searchText === "") {
      return rows;
    } else {
      return rows.filter((row) => {
        return Object.values(row)
          .join(" ")
          .toLowerCase()
          .includes(searchText.toLowerCase());
      });
    }
  };
  

  const classes = useStyles();
  const columns = [
    {
      flex: 0.4,
      minWidth: 100,
      field: 'prediction',
      headerName: 'Prediction',
      renderCell: ({ row }) =>  <Typography sx={{ fontWeight: 'bold', cursor: "pointer"}} className={classes.gradientText} variant='body2'>{row.prediction_title}</Typography>
    },
    {
      flex: 0.2,
      minWidth: 100,
      field: 'category',
      headerName: 'Category',
      renderCell: ({ row }) =>  <Typography variant='body2'>{row.tags}</Typography>
    },
   

  
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
        <Grid item={true} xs={12} md={12}>
        <Card>
                  <CardContent sx={{ padding: 3 }}>
                  <Typography sx={{ fontWeight: 'bold'}} className={classes.gradientText} variant='h5'>Dashboard</Typography>
                  <Typography>Welcome to your OKX dashboard.</Typography>
                  <br/>
                  </CardContent>
          </Card>
          </Grid>
       
          
         
          
          <Grid item={true} xs={12} md={12}>
          <Card>
          
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <Typography  sx={{ fontWeight: "bold"}} mb={5} className={classes.gradientText} variant="h5" align="left">View All Predictions</Typography>

                <div style={{ width: "100%" }}>
 
<TabContext value={value}>
        <TabList
          variant='scrollable'
          scrollButtons='auto'
          onChange={handleChange}
          aria-label='top referral sources tabs'
          sx={{
            mb: 0,
            px: 5,
            '& .MuiTab-root:not(:last-child)': { mr: 4 },
            '& .MuiTabs-indicator': { display: 'none' }
          }}
        >
           <Tab value='all' sx={{ p: 0 }} label={<RenderTabAvatar category='Dex' />} />
          <Tab value='climate' sx={{ p: 0 }} label={<RenderTabAvatar category='NFT' />} />
         

          
        
        </TabList>
        <TabPanel sx={{ p: 0, mt: 5, mb: 10 }} value='all'>
                                  
                      <DataGrid 
                      columns={columns}
                      rows={rows}
                      onRowClick={(row) => {
                      handleRowClick(web3.utils.toNumber(row.row.prediction_id.hex));
                       
                      }}
                                      components={{ Toolbar: GridToolbar }} 
                autoHeight // enable auto-height to ensure all rows are visible
                sx={{ p: 0, mb: 4, '& .MuiButton-root': { color: 'secondary.main' } }}
                getRowId={(row) => web3.utils.toHex(row.prediction_id)}
                />

                


       </TabPanel>
       <TabPanel sx={{ p: 0, mt: 5, mb: 10 }} value='climate'>
                                  
                                  <DataGrid 
                                  columns={columns}
                                  rows={rows}
                                  initialState={{
                                    filter: {
                                      filterModel: {
                                        items: [
                                          {
                                            columnField: 'category',
                                            value: "climate",
                                            operatorValue: 'contains',
                                          },
                                        ],
                                      },
                                    },
                                  }}
                            components={{ Toolbar: GridToolbar }} 
                            autoHeight // enable auto-height to ensure all rows are visible
                            sx={{ p: 0, mb: 4, '& .MuiButton-root': { color: 'secondary.main' } }}
                            getRowId={(row) => web3.utils.toHex(row.prediction_id)}

                            />
            
            
                   </TabPanel>
                   <TabPanel sx={{ p: 0, mt: 5, mb: 10 }} value='risks'>
                                  
                                  <DataGrid 
                                  columns={columns}
                                  rows={rows}
                                  initialState={{
                                    filter: {
                                      filterModel: {
                                        items: [
                                          {
                                            columnField: 'category',
                                            value: "risks",
                                            operatorValue: 'contains',
                                          },
                                        ],
                                      },
                                    },
                                  }}
                            components={{ Toolbar: GridToolbar }} 
                            autoHeight // enable auto-height to ensure all rows are visible
                            getRowId={(row) => web3.utils.toHex(row.prediction_id)}

                            sx={{ p: 0, mb: 4, '& .MuiButton-root': { color: 'secondary.main' } }}
                            />
            
            
                   </TabPanel>
                   <TabPanel sx={{ p: 0, mt: 5, mb: 10 }} value='finance'>
                                  
                                  <DataGrid 
                                  columns={columns}
                                  rows={rows}
                                  initialState={{
                                    filter: {
                                      filterModel: {
                                        items: [
                                          {
                                            columnField: 'category',
                                            value: "finance",
                                            operatorValue: 'contains',
                                          },
                                        ],
                                      },
                                    },
                                  }}
                                  getRowId={(row) => web3.utils.toHex(row.prediction_id)}

                            components={{ Toolbar: GridToolbar }} 
                            autoHeight // enable auto-height to ensure all rows are visible
                            sx={{ p: 0, mb: 4, '& .MuiButton-root': { color: 'secondary.main' } }}
                            />
            
            
                   </TabPanel>




       
</TabContext>
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





