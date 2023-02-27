import React, { useState } from "react";
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
const url = window.location.href;
const parts = url.split("?");
const [predictionID, setPredictionID] = useState('EaeobLyUTZ3XO2lpRjDp')

//setPredictionID(parts[parts.length - 1]);

  const classes = useStyles();


  const {
    data: prediction,
    status: predictionStatus,
    error: predictionError,
  } = usePredictionOnce(predictionID);
  const predictionDetails = usePredictionOnce(predictionID)

// page information
  const predictionTitle = prediction?.predictionTitle
  const options = prediction?.predictionBuckets
  const predictionCount = 47
  const predictionRewardAmount = 100
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
                <Typography variant="h5"  sx={{ fontWeight: "bold", mb: 4}} className={classes.gradientText} align="left">{predictionTitle}</Typography>

                
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

              <Typography sx={{ fontWeight: 'bold', marginLeft: 2 }}>
    <strong style={{ fontWeight: 'bold', padding: 3, ML: 5}}>Commited Capital:</strong>
  </Typography>
  <Typography sx={{ fontWeight: 'bold', marginLeft: 2 }} className={classes.gradientText}>
    {predictionRewardAmount} ETH
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

              <Typography sx={{ fontWeight: 'bold', marginLeft: 2 }}>
    <strong style={{ fontWeight: 'bold', padding: 3, ML: 5}}>Predictions:</strong>
  </Typography>
  <Typography sx={{ fontWeight: 'bold', marginLeft: 2 }} className={classes.gradientText}>
    {predictionCount}
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
          <Grid item={true} xs={12} md={12}>
            <Card>
              <CardContent sx={{ padding: 3 }}>
                <Box>
                  
              
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
