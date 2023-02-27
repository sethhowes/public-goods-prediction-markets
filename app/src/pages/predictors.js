import React from "react";
import { useRouter } from "next/router";
import Meta from "components/Meta";
import { useState } from "react";
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
import { DataGrid, GridToolbarContainer, GridToolbar } from "@mui/x-data-grid";
import { useDemoData } from "@mui/x-data-grid-generator";
import { Typography, Chip } from "@mui/material";
import Tab from '@mui/material/Tab'
import TabList from '@mui/lab/TabList'
import TabPanel from '@mui/lab/TabPanel'
import TabContext from '@mui/lab/TabContext'
import Avatar from '@mui/material/Avatar'
import { requireAuth } from "util/auth";

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
  const rows = [
    { id: 1, prediction: "What will be the global average temperature in 2042?", category: "climate", consensus: 25, price: 0.98, predictors: 22 },
    { id: 2, prediction: "What will the inflation rate be in 2027?", category: "finance", consensus: "4%", price: 0.20, predictors: 22 },
    { id: 3, prediction: "What decade will we achieve AGI?", category: "risks", consensus: "2040s", price: 0.68, predictors: 22 },
    ];
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
      field: 'label',
      headerName: 'Label',
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
          <Grid item={true} xs={12} md={12}>
          <Card>
          
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <Typography variant="h5"  sx={{ fontWeight: "bold", mb: 4}} className={classes.gradientText} align="left">Our Predictors</Typography>

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
           <Tab value='all' sx={{ p: 0 }} label={<RenderTabAvatar category='All' />} />
          

          
        
        </TabList>
        <TabPanel sx={{ p: 0, mt: 5, mb: 10 }} value='all'>
                                  
                      <DataGrid 

  
                      columns={columns}
                      rows={rows}
                      onRowClick={handleRowClick}
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

export default requireAuth(DashboardPage);





