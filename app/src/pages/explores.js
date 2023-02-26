import React from "react";
import Meta from "components/Meta";
import DashboardSection2 from "components/DashboardSection2";
import Navbar2 from "components/Navbar2";
import Footer from "components/Footer";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import Chart from "components/Chart"
import { PureComponent } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import PredictionData from "components/predictionData";
import PredictionMeta from "components/predictionMeta"
import { makeStyles } from "@mui/styles";
import {
  Box,
  Button,
  Container,
  Pagination,
  Stack,
  SvgIcon,
  Typography,
} from '@mui/material';
import  CompanyCard  from 'components/predictcard'; 
import  PredictSearch from 'components/predictsearch';

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
  const companies = [
    {
      id: '2569ce0d517a7f06d3ea1f24',
      createdAt: '27/03/2019',
      description: 'Dropbox is a file hosting service that offers cloud storage, file synchronization, a personal cloud.',
      logo: '/assets/logos/logo-dropbox.png',
      title: 'Dropbox',
      downloads: '594'
    },
    {
      id: 'ed2b900870ceba72d203ec15',
      createdAt: '31/03/2019',
      description: 'Medium is an online publishing platform developed by Evan Williams, and launched in August 2012.',
      logo: '/assets/logos/logo-medium.png',
      title: 'Medium Corporation',
      downloads: '625'
    },
    {
      id: 'a033e38768c82fca90df3db7',
      createdAt: '03/04/2019',
      description: 'Slack is a cloud-based set of team collaboration tools and services, founded by Stewart Butterfield.',
      logo: '/assets/logos/logo-slack.png',
      title: 'Slack',
      downloads: '857'
    },
    {
      id: '1efecb2bf6a51def9869ab0f',
      createdAt: '04/04/2019',
      description: 'Lyft is an on-demand transportation company based in San Francisco, California.',
      logo: '/assets/logos/logo-lyft.png',
      title: 'Lyft',
      downloads: '406'
    },
    {
      id: '1ed68149f65fbc6089b5fd07',
      createdAt: '04/04/2019',
      description: 'GitHub is a web-based hosting service for version control of code using Git.',
      logo: '/assets/logos/logo-github.png',
      title: 'GitHub',
      downloads: '835'
    },
    {
      id: '5dab321376eff6177407e887',
      createdAt: '04/04/2019',
      description: 'Squarespace provides software as a service for website building and hosting. Headquartered in NYC.',
      logo: '/assets/logos/logo-squarespace.png',
      title: 'Squarespace',
      downloads: '835'
    }
  ];
  const classes = useStyles();

  return (

    <Box
    component="main"
    sx={{
      flexGrow: 1,
      py: 8
    }}
  >
    <Container maxWidth="xl">
      <Stack spacing={3}>
        <Stack
          direction="row"
          justifyContent="space-between"
          spacing={4}
        >
          <Stack spacing={1}>
            <Typography variant="h4">
              Companies
            </Typography>
            <Stack
              alignItems="center"
              direction="row"
              spacing={1}
            >
           
            </Stack>
          </Stack>
          <div>
            <Button
              startIcon={(
                <SvgIcon fontSize="small">
                </SvgIcon>
              )}
              variant="contained"
            >
              Add
            </Button>
          </div>
        </Stack>
         <PredictSearch /> 
        <Grid
          container
          spacing={3}
        >
          {companies.map((company) => (
            <Grid
              xs={12}
              md={6}
              lg={4}
              key={company.id}
            >
              <CompanyCard company={company} /> 
            </Grid>
          ))}
        </Grid>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center'
          }}
        >
          <Pagination
            count={3}
            size="small"
          />
        </Box>
      </Stack>
    </Container>
  </Box>
    
  );
}

export default DashboardPage;
