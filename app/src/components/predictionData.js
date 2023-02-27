import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import { Chip } from "@mui/material";


function predictionData(props) {
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [values, setValues] = useState([]); // <-- state for storing entered values
  const [description, setDescription] = useState([]); // 
  const [name, setName] = useState([]); // 
  const setPredictionTitle = props.setPredictionTitle
  const setPredictionUnit = props.setPredictionUnit
  const setPredictionDescription = props.setPredictionDescription
 // const setPredictionIncrement = props.setPredictionIncrements
  const setPredictionBuckets = props.setPredictionBuckets
  const setPredictionCategory = props.setPredictionCategory
  const setPredictionApiEndpoint = props.setPredictionApiEndpoint
  setPredictionBuckets(values)
  const { handleSubmit, register, errors, reset } = useForm();
 
  
  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

   
  };
  const handleAddValue = () => {
    const value = document.querySelector("#value").value + " " + document.querySelector("#unit").value ;
    if (value) {
      setValues([...values, value]); // <-- add the entered value to the list of values
      document.querySelector("#value").value = "";
    }
  };

  return (
    <>
      {formAlert && (
        <Alert severity={formAlert.type} sx={{ mb: 3 }}>
          {formAlert.message}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)}>
        <Grid container={true} spacing={2}>
            <Grid item={true} xs={12} >
              <TextField
                type="text"
                label="Prediction Title"
                color="secondary"
                name="prediction"
                error={errors.name ? true : false}
                helperText={errors.name && errors.name.message}
                fullWidth={true}
                onChange={e => setPredictionTitle(e.target.value)}
                inputRef={register({
                  required: "Please enter your prediction title",
                })}
              />
            </Grid>
        

        
          <Grid item={true} xs={12}>
            <TextField
              type="text"
              label="Prediction Description"
              name="message"
              color="secondary"

              multiline={true}
              rows={5}
              error={errors.message ? true : false}
              helperText={errors.message && errors.message.message}
              fullWidth={true}
              onChange={e => setPredictionDescription(e.target.value)}
              inputRef={register({
                required: "Please enter a message",
              })}
            />
          </Grid>
          <Grid item={true} xs={12}>
          <TextField sx = {{mr:4}}
              type="unit"
              label="Unit"
              color="secondary"

              name="unit"
              id="unit"
              onChange={e => setPredictionUnit(e.target.value)}

            />
            {/* Input field for adding a new value */}
            <TextField
              type="text"
              label="Prediction Options"
              color="secondary"

              name="value"
              id="value"
            />
            {/* Button to add the entered value as a chip */}
            <Button variant="secondary" onClick={handleAddValue} sx={{ ml:  4, height: '100%', backgroundImage: 'linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)',
          color: 'white',
          mt: 0}}>
              Add Prediction Bucket
            </Button>
           
          </Grid>

          <Grid item={true} xs={12}>
            {/* Display the entered values as chips */}
            {values.map((value, index) => (
              <Chip
                key={index}
                label={value}
                onDelete={() => {
                  setValues(values.filter((v) => v !== value));
                }}
                sx={{ mr: 1, mb: 1 }}
              />
            ))}
          </Grid>
          <Grid item={true} xs={12}>
              <TextField
                type="text"
                color="secondary"

                label="API Endpoint"
                name="endpoint"
                error={errors.name ? true : false}
                helperText={errors.name && errors.name.message}
                fullWidth={true}
                onChange={e => setPredictionApiEndpoint(e.target.value)}
                inputRef={register({
                  required: "Please enter your validation endpoint",
                })}
              />
           
          </Grid>
        

        </Grid>
      </form>
    </>
  );
}

export default predictionData;