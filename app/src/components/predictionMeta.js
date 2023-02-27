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

function predictionMeta(props) {
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [values, setValues] = useState([]); // <-- state for storing entered values
  const [description, setDescription] = useState([]); // 
  const [name, setName] = useState([]); // 
  const [selectedEndDate, setSelectedEndDate] = useState(null);


  const { handleSubmit, register, errors, reset } = useForm();

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

   
  };


  const handleEndDateChange = (date) => {
    setSelectedEndDate(date);
  };

 

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
    disableFuture={true}
    value={selectedEndDate}
    onChange={handleEndDateChange}
    inputRef={register({
      required: "Please select a date",
    })}
    renderInput={(params) => <TextField {...params} />}
  />
  </Grid>
  <Grid item xs={12}>  

  <TextField
              type="text"
              label="Committed Funds"
              name="value"
              id="value"
            />
  </Grid>

  {/* Dropdown selector */}
    {/* Permissioned Checkmark */}
    {/* Category API End Point */}
    {/* API End Point */}



          <Grid item={true} xs={12}>
          <Button disabled={!selectedEndDate}
        onClick="" component="a" variant="contained" sx={{
          backgroundImage: 'linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)',
          color: 'white',
          mt: 2,
        }} >
    

{pending && <CircularProgress size={28} />}            </Button>
            
            
          </Grid>

        </Grid>
      </form>
    </>
    </LocalizationProvider>

  );
}

export default predictionMeta;