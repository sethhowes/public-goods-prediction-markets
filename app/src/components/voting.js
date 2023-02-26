import React, { useState } from "react";
import Button from "@mui/material/Button";

const VotingComponent = ({ useStyles, options }) => {
  const classes = useStyles();

  const [selectedOption, setSelectedOption] = useState(null);
  const [quantity, setQuantity] = useState(1);
 const getPrice = (option) => {
    // Your code to get the price for the option here...
    // This function assumes that the prices are stored in an object
    // where the keys are the option names and the values are the prices.
    const prices = {
      "Option A": 0.91,
      "Option B": 0.07,
      "Option C": 0.02,
    };
    return prices[option];
  };

  const subtotal = selectedOption ? getPrice(selectedOption) * quantity : 0;

  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };
  const handleQuantityChange = (event) => {
    setQuantity(Number(event.target.value));
  };

  const handlePrediction = () => {
    console.log("Making prediction for option:", selectedOption);
    // Your code to make prediction here...
  };

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        {options.map((option) => (
          <button
            key={option}
            onClick={() => handleOptionSelect(option)}
            style={{
              backgroundColor: "#f8f8f8",
              borderRadius: "5px",
              color: selectedOption === option ? "#688ff6" : "black",
              border: selectedOption === option ? "2px solid #688ff6" : "none",
              padding: "10px",
              margin: "5px",
              marginTop: "2px",
              cursor: "pointer",
              fontWeight: "bold", // Add this line

            }}
          >
            {option} - ${getPrice(option)}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", marginTop: "20px" }}>
      <label>
          Quantity:
          <input type="number" value={quantity} onChange={handleQuantityChange} style={{ width: "60px" }} />
        </label>
        <Button
          disabled={!selectedOption}
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
Predict        </Button>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginTop: "20px" }}>
        <div>
          Subtotal: ${(subtotal).toFixed(2)}
        </div>
        </div>
        {selectedOption && (

<div style={{ fontWeight: "bold", textAlign: "center", marginTop: "20px" }} className={classes.gradientText}>
Expected Payoff: ${((quantity*1) - subtotal).toFixed(2)}
        </div>)}
      </div>
  );
};

export default VotingComponent;
