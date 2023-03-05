import React, { useEffect, useState } from "react";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import { Chip } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import OutlinedInput from "@mui/material/OutlinedInput";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

const names = ["Climate", "Existential Risk", "Finance", "EthDenver"];

function getStyles(name, personName, theme) {
  return {
    fontWeight:
      personName.indexOf(name) === -1
        ? theme.typography.fontWeightRegular
        : theme.typography.fontWeightMedium,
  };
}

function predictionData(props) {
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);
  const [values, setValues] = useState([]); // <-- state for storing entered values
  const [description, setDescription] = useState([]); //
  const [name, setName] = useState([]); //
  const setPredictionTitle = props.setPredictionTitle;
  const setPredictionUnit = props.setPredictionUnit;
  const setPredictionDescription = props.setPredictionDescription;
  // const setPredictionIncrement = props.setPredictionIncrements
  const setPredictionBuckets = props.setPredictionBuckets;
  const setPredictionCategory = props.setPredictionCategory;
  const setPredictionApiEndpoint = props.setPredictionApiEndpoint;
  const setPredictionWhitelisted = props.setPredictionWhitelisted;
  const setPredictionPermissioned = props.setPredictionPermissioned;
  setPredictionBuckets(values);
  const { handleSubmit, register, errors, reset } = useForm();

  const theme = useTheme();
  const [personName, setPersonName] = React.useState([]);
  const [localPredictionPermissioned, setLocalPredictionPermissioned] = React.useState(false)
  

  const handlePredictionPermissioned = ((result) => {
    setLocalPredictionPermissioned(result);
    setPredictionPermissioned(result);
  })

  const handleChange = (event) => {
    const {
      target: { value },
    } = event;
    setPersonName(
      // On autofill we get a stringified value.
      typeof value === "string" ? value.split(",") : value
    );
    setPredictionWhitelisted(event.target.value);
  };

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);
  };

  const handleAddValue = () => {
    const value = document.querySelector("#value").value;

    // Regular expression to check if the entered value is a number or true/false
    const numberOrBooleanRegex = /^(\d+|\d*\.\d+|true|false)$/;

    // Check if the entered value matches the pattern of a number or true/false
    if (numberOrBooleanRegex.test(value)) {
      // Convert true/false to 0/1 and numbers to integers
      const convertedValue =
        value === "true" ? 1 : value === "false" ? 0 : parseInt(value, 10);
      setValues([...values, convertedValue]);
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
          <Grid item={true} xs={12}>
            <TextField
              type="text"
              label="Prediction Title"
              color="secondary"
              name="prediction"
              sx={{marginTop: "15px"}}
              error={errors.name ? true : false}
              helperText={errors.name && errors.name.message}
              fullWidth={true}
              onChange={(e) => setPredictionTitle(e.target.value)}
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
              onChange={(e) => setPredictionDescription(e.target.value)}
              inputRef={register({
                required: "Please enter a message",
              })}
            />
          </Grid>
          <Grid item={true} xs={12}>
            <TextField
              sx={{ mr: 4 }}
              type="unit"
              label="Unit"
              color="secondary"
              name="unit"
              id="unit"
              onChange={(e) => setPredictionUnit(e.target.value)}
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
            <Button
              variant="secondary"
              onClick={handleAddValue}
              sx={{
                ml: 4,
                height: "100%",
                backgroundImage:
                  "linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)",
                color: "white",
                mt: 0,
              }}
            >
              Add
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
                sx={{ mr: 1, mb: 0 }}
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
              onChange={(e) => setPredictionApiEndpoint(e.target.value)}
              inputRef={register({
                required: "Please enter your validation endpoint",
              })}
            />
          </Grid>
          <Grid item={true} xs={12}>
          <FormControlLabel
              color="secondary"
              control={<Checkbox sx={{marginLeft: "10px", marginTop: "10px"}} color="secondary" onChange={(e) => handlePredictionPermissioned(e.target.checked)} defaultChecked />}
              label="Permissioned"
            />
            <FormControl sx={{ marginTop: "3px", width: 500}} disabled={!localPredictionPermissioned}>
              <InputLabel color="secondary" id="demo-multiple-name-label">
                Name
              </InputLabel>

              <Select
                labelId="demo-multiple-name-label"
                id="demo-multiple-name"
                multiple
                color="secondary"
                value={personName}
                onChange={handleChange}
                input={<OutlinedInput label="name" />}
                MenuProps={MenuProps}
              >
                {names.map((name) => (
                  <MenuItem
                    key={name}
                    value={name}
                    style={getStyles(name, personName, theme)}
                  >
                    {name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item={true} xs={12}>
            
          </Grid>
        </Grid>
      </form>
    </>
  );
}

export default predictionData;
