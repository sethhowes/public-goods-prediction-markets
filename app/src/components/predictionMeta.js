import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import { Chip } from "@mui/material";
import { DatePicker } from "@mui/lab";
import AdapterDateFns from '@mui/lab/AdapterDateFns';
import LocalizationProvider from '@mui/lab/LocalizationProvider';
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { createTheme, ThemeProvider } from '@mui/material/styles';

function predictionMeta(props) {
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [values, setValues] = useState([]); // <-- state for storing entered values
  const [description, setDescription] = useState([]); // 
  const [name, setName] = useState([]); // 
  const setPredictionRewardAmount= props.setPredictionRewardAmount
  const setPredictionTokenAddress= props.setPredictionTokenAddress
  const setPredictionRewardCurve= props.setPredictionRewardCurve
  const setPredictionPermissioned= props.setPredictionPermissioned
  const setPredictionEndDate= props.setPredictionEndDate
  const setPredictionApiEndpoint= props.setPredictionApiEndpoint
  const setPredictionCategory= props.setPredictionCategory
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(""); // <-- state for storing selected category

  const { handleSubmit, register, errors, reset } = useForm();

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

   
  };

  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
    setPredictionEndDate(date)

  };
  const handleCategoryChange = (event) => {
    setSelectedCategory(event.target.value);
    setPredictionCategory(event.target.value)
  }

  const categories = [
    "climate",
    "risk",
    "finance",
    "ETHDenver"

  ]; 
 

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>

    <>
      {formAlert && (
        <Alert severity={formAlert.type} sx={{ mb: 3 }}>
          {formAlert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container={true} spacing={2}>
      
        

<Grid item xs={12}>  
<DatePicker
    label="End Date"
    name="date"
    color="secondary"
    disableFuture={false}
    value={props.predictionEndDate}
    onChange={handleEndDateChange}
    fullWidth={true}

    inputRef={register({
      required: "Please select a date",
    })}
    renderInput={(params) => <TextField {...params} />}
  />
  </Grid>
  <Grid item xs={12}>  

  <TextField
              type="text"
              color="secondary"

              label="Reward Amount"
              onChange={e => setPredictionRewardAmount(e.target.value)}
              name="value"
              id="value"
              fullWidth={true}

            />

  </Grid>
  <Grid item xs={12}>
              <Select
                labelId="category-select-label"
                id="category-select"
                color="secondary"

                value={selectedCategory}
                fullWidth={true}

                onChange={handleCategoryChange}
                displayEmpty
              >
                <MenuItem value="" disabled>
                  Select category
                </MenuItem>
                {categories.map((category, index) => (
                  <MenuItem key={index} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </Grid>



          <Grid item={true} xs={12}>
          
            
            
          </Grid>

        </Grid>
      </form>
    </>
    </LocalizationProvider>

  );
}

export default predictionMeta;