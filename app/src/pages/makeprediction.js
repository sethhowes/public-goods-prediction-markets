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
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import PredictionData from "components/predictionData";
import PredictionMeta from "components/predictionMeta"
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";

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
  
  const classes = useStyles();

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
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <Typography variant="h5"  sx={{ fontWeight: "bold", mb: 4}} className={classes.gradientText} align="left">Request Prediction</Typography>

                
        <PredictionData
          showNameField={props.showNameField}
          buttonText={props.buttonText}
          buttonColor={props.buttonColor}
        />
         </Box>
              </CardContent>
            </Card>
            </Grid>
                     <Grid item={true} xs={12} md={4}>
            <Grid item mb={4}> 
            <Card>
              <CardContent sx={{ padding: 3 }}>
                <Box>
                <SectionHeader
          title= "Additional Information"
          subtitle= ""
          size={7}
          sx={{ textAlign: "left" }}
        />
                <PredictionMeta
          showNameField={props.showNameField}
          buttonText={props.buttonText}
          buttonColor={props.buttonColor}
        />
              
                </Box>
              </CardContent>
            </Card>
          </Grid>
          </Grid>
          
          </Grid>

          
      </Container>
    </Section>
      
       
   
    </>

    
  );
}

export default DashboardPage;
