import React, { useState } from "react";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import { createVote } from "util/db";
import { useAuth } from "util/auth";
import { useSigner } from "wagmi";
import {contract} from "../util/contract";
import {get_quote} from 'util/multicall.js'
import Web3 from "web3";

const VotingComponent = (props) => {
  // Get contract with signer to make bet
  const { data: signer, isError, isLoading } = useSigner();
  const contractWithSigner = contract.connect(signer);

  const [formAlert, setFormAlert] = useState(null);
  const auth = useAuth();
  const web3 = new Web3();

  const classes = props.useStyles();
  const [selectedOption, setSelectedOption] = useState(0);
  const [stake, setStake] = useState(1);
  const getPrice = (index) => {
    const prices = props.predictionBucketPrices;
    return prices[index];
  };


  const handleFormAlert = (data) => {
    setFormAlert(data);
  };
  // 10 ^ 18
  const subtotal = getPrice(selectedOption) * stake;
  const price = getPrice(selectedOption);
  const [showPayoff, setShowPayoff] = useState(); //
  const [quote, setQuote] = useState()
  async function fetchData() {
    const result = await  get_quote(props.rpc_url, props.contract_address, props.abi, props.prediction_id, proposed_bet, bucket_index)
    setQuote (result)

  } 
  const handleOptionSelect = (index) => {
    setSelectedOption(index);
    setShowPayoff(true);
    fetchData();
    console.log('quote', quote)
    




  };

  // Current quote
let proposed_bet = 1e3.toString();
proposed_bet = stake.toString()
let bucket_index = 0;
bucket_index = selectedOption 

 
  

  const showValue = selectedOption + 1;
  const handleQuantityChange = (event) => {
    setStake(Number(event.target.value));
  };
  const handlePrediction = async () => {
    handleFormAlert({
      type: "success",
      message: `Prediction created successfully`,
    });

    const tx = await contractWithSigner.placeBet(props.prediction_id, bucket_index, {value: stake}) // UPDATE PARAMETERS WITH PREDICTION ID, BUCKET INDEX @todo

    createVote({ selectedOption, stake, user: auth.user.uid });
    // Your code to make prediction here...
  };

  return (
    <div>
      {formAlert && (
        <Alert severity={formAlert.type} sx={{ mb: 3 }}>
          {formAlert.message}
        </Alert>
      )}

      <div style={{ display: "flex", flexDirection: "column" }}>
        {props.options?.map((option, index) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(index)}
            style={{
              backgroundColor: "#f8f8f8",
              borderRadius: "5px",
              color: selectedOption === index ? "#688ff6" : "black",
              border: selectedOption === index ? "2px solid #688ff6" : "none",
              padding: "10px",
              margin: "5px",
              marginTop: "2px",
              cursor: "pointer",
              fontWeight: "bold", // Add this line
            }}
          >
            {option}
          </button>
        ))}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          marginTop: "20px",
        }}
      >
        <label>
          Stake:
          <input
            type="number"
            value={stake}
            onChange={handleQuantityChange}
            style={{ width: "60px" }}
          />
        </label>
        <Button
          disabled={!showPayoff}
          onClick={handlePrediction}
          component="a"
          variant="contained"
          sx={{
            backgroundImage:
              "linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)",
            color: "white",
            ml: 2,
          }}
        >
          Predict{" "}
        </Button>
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
{showPayoff && quote && <div>Odds:{quote[0]} </div>}
      </div>
      {showPayoff && quote && quote.length >= 2 && (
        <div
          style={{ fontWeight: "bold", textAlign: "center", marginTop: "20px" }}
          className={classes.gradientText}
        >      
 Expected Payoff: {quote[1]}    
        </div>
      )}
    </div>
  );
};

export default VotingComponent;
