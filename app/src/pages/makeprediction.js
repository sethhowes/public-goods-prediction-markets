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
import PredictionMeta from "components/predictionMeta";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import { requireAuth } from "util/auth";
import { useState } from "react";
import { createPrediction } from "util/db";
import { Button } from "@mui/material";
import Alert from "@mui/material/Alert";
import router from "next/router";
import { useAuth } from "util/auth";
import contract from "../util/contract";
import { useSigner } from "wagmi";
import convertUnixTime from "util/convertUnixTime";
import { ethers } from "ethers";
import { distributeFunds } from "../util/distributeFunds";
import getHistoricalBets from "util/getHistoricalBets";

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
  // Hook for getting signer object
  const { data: signer, isError, isLoading } = useSigner();

  const [formAlert, setFormAlert] = useState(null);
  const auth = useAuth();
  const classes = useStyles();
  const [predictionTitle, setPredictionTitle] = useState("Prediction");
  const [predictionDescription, setPredictionDescription] =
    useState("Description 1");
  const [predictionUnit, setPredictionUnit] = useState("Unit");
  const [predictionIncrement, setPredictionIncrement] = useState(1);
  const [predictionBuckets, setPredictionBuckets] = useState([
    "Outcome 1",
    "Outcome 2",
  ]);
  const [predictionRewardAmount, setPredictionRewardAmount] = useState(3);
  const [predictionEndDate, setPredictionEndDate] = useState();
  const [predictionCategory, setPredictionCategory] = useState("finance");
  const [predictionApiEndpoint, setPredictionApiEndpoint] =
    useState("API Endpoint");
  const [predictionRewardCurve, setPredictionRewardCurve] =
    useState("Reward Curve");
  const [predictionPermissioned, setPredictionPermissioned] = useState(true);
  const [predictionTokenAddress, setPredictionTokenAddress] = useState(0);
  const [predictionOutcome, setPredictionOutcome] = useState("Outcome");
  const [predictionOutcomeProbability, setPredictionOutcomeProbability] =
    useState("Outcome Probability");
  const [predictionOutcomeReward, setPredictionOutcomeReward] =
    useState("Outcome Reward");
  const [predictionOutcomeRewardAmount, setPredictionOutcomeRewardAmount] =
    useState("Outcome Reward Amount");
  const handleFormAlert = (data) => {
    setFormAlert(data);
  };

  // Connect signer with contract
  const contractWithSigner = contract.connect(signer);

  const handleSubmit = async () => {
    createPrediction({
      predictionTitle,
      predictionDescription,
      predictionUnit,
      predictionIncrement,
      predictionBuckets,
      predictionRewardAmount,
      predictionTokenAddress,
      predictionRewardCurve,
      predictionPermissioned,
      predictionEndDate,
      predictionCategory,
      predictionApiEndpoint,
      user: auth.user.uid,
    });
    distributeFunds();
    // Converts date state object to UNIX time
    const unixEndDate = convertUnixTime(predictionEndDate);

  
    // Split reward amount
    const initialBucketAmounts = distributeFunds(predictionRewardAmount);
    
    const historicalBets = getHistoricalBets("0xdc6Dc980F7F2491b352517B27D0e6Af9baa42501", 0); // @todo display this data on the front end
    const tx = await contractWithSigner.createPrediction(
      predictionTitle,
      predictionUnit,
      [1,2,3], // NEEDS TO BE UPDATED WITH BUCKET CONTENTS AS uint[] @todo
      predictionRewardAmount,
      ethers.constants.AddressZero,
      predictionRewardCurve,
      predictionPermissioned,
      unixEndDate,
      predictionCategory,
      predictionApiEndpoint,
      "",
      initialBucketAmounts,
      {
        value: predictionRewardAmount,
      }
    );

    handleFormAlert({
      type: "success",
      message: "Prediction created successfully!",
    });
    router.replace("/viewall");

    handleFormAlert({
      type: "success",
      message: "Prediction created successfully!",
    });
    router.replace("/dashboard");
  };

  return (
    /*  title, // Prediction title
    unit, // Unit string
    1, // Increment unit
    buckets, // Array of outcomes
    rewardAmount,
    0, // Token address KEEP AS NULL FOR NOW
    "exponential", // Reward curve
    true, // Permissioned
    endDate,
    category,
    apiendpoint,
    { value: rewardAmount } */
    <>
      <Meta title="Dashboard" />
      <Section
        bgColor={props.bgColor}
        size={props.size}
        bgImage={props.bgImage}
        bgImageOpacity={props.bgImageOpacity}
      >
        {formAlert && (
          <Alert severity={formAlert.type} sx={{ mb: 3 }}>
            {formAlert.message}
          </Alert>
        )}

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
                    <Typography
                      variant="h5"
                      sx={{ fontWeight: "bold", mb: 4 }}
                      className={classes.gradientText}
                      align="left"
                    >
                      Request Prediction
                    </Typography>

                    <PredictionData
                      showNameField={props.showNameField}
                      buttonText={props.buttonText}
                      buttonColor={props.buttonColor}
                      setPredictionTitle={setPredictionTitle}
                      setPredictionUnit={setPredictionUnit}
                      setPredictionIncrement={setPredictionIncrement}
                      setPredictionBuckets={setPredictionBuckets}
                      setPredictionCategory={setPredictionCategory}
                      setPredictionDescription={setPredictionDescription}
                      setPredictionApiEndpoint={setPredictionApiEndpoint}
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
                        title="Additional Information"
                        subtitle=""
                        size={7}
                        sx={{ textAlign: "left" }}
                      />
                      <PredictionMeta
                        showNameField={props.showNameField}
                        buttonText={props.buttonText}
                        buttonColor={props.buttonColor}
                        setPredictionRewardAmount={setPredictionRewardAmount}
                        setPredictionTokenAddress={setPredictionTokenAddress}
                        setPredictionRewardCurve={setPredictionRewardCurve}
                        setPredictionPermissioned={setPredictionPermissioned}
                        setPredictionEndDate={setPredictionEndDate}
                        predictionEndDate={predictionEndDate}
                      />
                      <Button
                        disabled={!predictionEndDate}
                        onClick={handleSubmit}
                        component="a"
                        variant="contained"
                        sx={{
                          backgroundImage:
                            "linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)",
                          color: "white",
                          mt: 2,
                        }}
                      >
                        {" "}
                        <span>Add Prediction</span>{" "}
                      </Button>
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
