import React, { useEffect, useState, PureComponent } from "react";

import Meta from "components/Meta";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import { useAccount } from "wagmi";

import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  defs,
  linearGradient,
  stop,
} from "recharts";
import VotingComponent from "components/voting";
import Typography from "@mui/material/Typography";

import ColorTabs from "components/TabSection";

import PeopleIcon from "@mui/icons-material/People";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import { makeStyles } from "@mui/styles";
import {
  getHistoricalBetAmounts,
  getHistoricalBetTimestamps,
} from "util/getHistoricalBets";
import {
  get_prediction_market_details,
  get_all_user_per_market,
} from "util/multicall.js";
import { PieChart, Pie, Sector, Cell, ResponsiveContainer } from "recharts";
import { abi, contract_address, rpc_url } from "util/contract.js";
import { convertToDecimal } from "util/convertToDecimal";
import { parseHistoricalBets } from "util/parseHistoricalBets";
import { sumBuckets } from "util/sumBuckets";

import Web3 from "web3";

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

  const { address, isConnecting, isDisconnected } = useAccount();

  let prediction_id = 0;

  if (typeof window !== "undefined") {
    const url = window.location.href;
    const parts = url.split("?");

    prediction_id = parts[parts.length - 1];
  }

  const [predictionMarketDetails, setPredictionMarketDetails] = useState(null);
  const [readableRewardAmount, setReadableRewardAmount] = useState(null);
  const [readableDeadline, setReadableDeadline] = useState(null);
  const [readablePredictionID, setReadablePredictionID] = useState(null);
  const [readablePredictionOutcome, setReadablePredictionOutcome] =
    useState(null);
  const [readableCommittedAmountBucket, setReadableCommittedAmountBucket] =
    useState(null);
  const [predictionBuckets, setPredictionBuckets] = useState(null);
  const [trueBucket, setTrueBucket] = useState(500);
  const [falseBucket, setFalseBucket] = useState(500);
  const pieData = [
    { name: "True", value: trueBucket },
    { name: "False", value: falseBucket },
  ];
  useEffect(() => {
    async function fetchData() {
      const result = await get_prediction_market_details(
        rpc_url,
        contract_address,
        abi,
        prediction_id
      );
      const decimalResults = convertToDecimal(result);
      setTrueBucket(decimalResults[0]);
      setFalseBucket(decimalResults[1]);

      setPredictionMarketDetails(result);

      // Convert reward_amount to a readable value
      setReadableRewardAmount(
        web3.utils.toHex(predictionMarketDetails?.reward_amount)
      );
      // Convert deadline to a readable value (assuming it represents a Unix timestamp)
      const readable_deadline =
        web3.utils.toNumber(predictionMarketDetails?.deadline?.hex) * 1000;
      setReadableDeadline(readable_deadline);

      // Convert prediction_id to a readable value

      setReadablePredictionID(
        web3.utils.toNumber(predictionMarketDetails?.prediction_id?.hex)
      );
      // Convert outcome to a readable value

      setReadablePredictionOutcome(
        web3.utils.toNumber(predictionMarketDetails?.outcome?.hex)
      );
      // Convert prediction_bucket to readable values
      setReadableCommittedAmountBucket(
        predictionMarketDetails?.committed_amount_bucket?.map((bucket) =>
          web3.utils.hexToNumber(bucket.hex)
        )
      );
      /* const betAmounts = await getHistoricalBetAmounts(0);
      const betTimestamps = await getHistoricalBetTimestamps(0);

      const amounts = parseHistoricalBets(betAmounts);
      const timestamps = parseHistoricalBets(betTimestamps);
 */
      // console.log(amounts);

    }

    fetchData();
    
  }, []);

  //setPredictionID(parts[parts.length - 1]);

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
  const [pie, setPie] = useState();

  const predictionTitle = predictionMarketDetails?.prediction_title;
  const predictionBucket = predictionMarketDetails?.prediction_bucket;

  const options = predictionBucket?.map((bucket) => {
    if (
      predictionBucket.length === 2 &&
      bucket.type === "BigNumber" &&
      (bucket.hex === "0x00" || bucket.hex === "0x01")
    ) {
      return bucket.hex === "0x00" ? "No" : "Yes";
    } else {
      return parseInt(bucket.hex);
    }
  });

  useEffect(async () => {
    if (predictionBucket?.length === 2) {
      setPie(1);
    }
  }, [predictionBucket]);

  const predictionCount = 47;
  const predictionRewardAmount = web3.utils.toHex(
    predictionMarketDetails?.reward_amount
  );
  const predictionBucketPrices = [0.91, 0.07, 0.09];
  const hexString = predictionMarketDetails?.deadline.hex;
  const bigIntValue = hexString ? web3.utils.toBN(hexString) : null;
  if (bigIntValue) {
  } else {
    // handle the case where hexString is not defined
  }
  //graph data
  const COLORS = ["#0088FE", "#00C49F"];

  const data = [
    {
      name: "2018",
      Temperature: 4,
    },
    {
      name: "2019",
      Temperature: 2,
    },
    {
      name: "2020",
      Temperature: 1,
    },
    {
      name: "2021",
      Temperature: 2,
    },
    {
      name: "2022",
      Temperature: 3,
    },
    {
      name: "2023",
      Temperature: 4,
    },
    {
      name: "2024",
      Temperature: 5,
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
                <CardContent sx={{}}>
                  <Box>
                    <Typography
                      component={"span"}
                      sx={{ fontWeight: "bold", mb: 4, fontSize: 24 }}
                      className={classes.gradientText}
                      align="left"
                    >
                      {predictionTitle}
                    </Typography>

                    {pie === 1 ? (
                      <div style={{ height: "400px", width: "100%" }}>
                        <ResponsiveContainer>
                          <PieChart width={400} height={400}>
                            <Pie
                              data={pieData}
                              cx="50%"
                              cy="50%"
                              outerRadius={150}
                              fill="#8884d8"
                              dataKey="value"
                              label={(entry) => entry.name}
                            >
                              {pieData.map((entry, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={COLORS[index % COLORS.length]}
                                />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    ) : (
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
                          <linearGradient
                            id="colorUv"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                          >
                            <stop offset="0%" stopColor="#1EBEA5" />
                            <stop
                              offset="100%"
                              stopColor="rgba(255, 255, 255, 0)"
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend legendType="line" />
                        //{" "}
                        <Area
                          tooltipType="none"
                          legendType="none"
                          type="monotone"
                          dataKey="temperature"
                          stroke={false}
                          strokeWidth={2}
                          fillOpacity={1}
                          fill="url(#colorUv)"
                        />
                        <Line
                          type="monotone"
                          dataKey="Temperature"
                          activeDot={{ r: 8 }}
                          stroke="#00B5C4"
                          strokeWidth={3}
                        />
                      </ComposedChart>
                    )}
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

                      <Typography
                        component={"span"}
                        sx={{ fontWeight: "bold", marginLeft: 2 }}
                      >
                        <strong
                          style={{ fontWeight: "bold", padding: 3, ML: 5 }}
                        >
                          Committed Capital:
                        </strong>
                      </Typography>
                      <Typography
                        component={"span"}
                        sx={{ fontWeight: "bold", marginLeft: 2 }}
                        className={classes.gradientText}
                      >
                        {
                          sumBuckets(predictionMarketDetails?.committed_amount_bucket, predictionMarketDetails?.committed_amount_bucket.length)
                        }{" "}
                        ETH
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

                        <Typography
                          component={"span"}
                          sx={{ fontWeight: "bold", marginLeft: 2 }}
                        >
                          <strong
                            style={{ fontWeight: "bold", padding: 3, ML: 5 }}
                          >
                            Deadline:
                          </strong>
                        </Typography>
                        <Typography
                          component={"span"}
                          sx={{ fontWeight: "bold", marginLeft: 2 }}
                          className={classes.gradientText}
                        >
                          {new Date(
                            web3.utils.toNumber(
                              predictionMarketDetails?.deadline.hex
                            ) * 1000
                          ).toLocaleString()}
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
                      <VotingComponent
                        rpc_url={rpc_url}
                        predictionBuckets={predictionBuckets}
                        setPredictionBuckets={setPredictionBuckets}
                        prediction_id={prediction_id}
                        contract_address={contract_address}
                        abi={abi}
                        useStyles={useStyles}
                        options={options}
                        predictionBucketPrices={predictionBucketPrices}
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
            <Grid item={true} xs={12} md={12}>
              <Card>
                <CardContent sx={{ padding: 3 }}>
                  <Box>
                    <ColorTabs
                     options={options}
                      userAddress={address}
                      creatorAddress={predictionMarketDetails?.creator_address}
                      useStyles={useStyles}
                    />
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
