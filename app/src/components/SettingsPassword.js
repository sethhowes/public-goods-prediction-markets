import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";

function SettingsPassword(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);

  const { register, handleSubmit, errors, reset, getValues } = useForm();

  const onSubmit = (data) => {
    // Show pending indicator
    setPending(true);

    auth
      .updatePassword(data.pass)
      .then(() => {
        // Clear form
        reset();
        // Set success status
        props.onStatus({
          type: "success",
          message: "Your password has been updated",
        });
      })
      .catch((error) => {
        if (error.code === "auth/requires-recent-login") {
          // Update state to show re-authentication modal
          props.onStatus({
            type: "requires-recent-login",
            // Resubmit after reauth flow
            callback: () => onSubmit({ pass: data.pass }),
          });
        } else {
          // Set error status
          props.onStatus({
            type: "error",
            message: error.message,
          });
        }
      })
      .finally(() => {
        // Hide pending indicator
        setPending(false);
      });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container={true} spacing={2}>
        <Grid item={true} xs={12}>
          <TextField
            type="password"
            label="Password"
            name="pass"
            placeholder="Password"
            error={errors.pass ? true : false}
            helperText={errors.pass && errors.pass.message}
            fullWidth={true}
            inputRef={register({
              required: "Please enter a password",
            })}
          />
        </Grid>
        <Grid item={true} xs={12}>
          <TextField
            type="password"
            label="Confirm New Password"
            name="confirmPass"
            placeholder="Confirm Password"
            error={errors.confirmPass ? true : false}
            helperText={errors.confirmPass && errors.confirmPass.message}
            fullWidth={true}
            inputRef={register({
              required: "Please enter your new password again",
              validate: (value) => {
                if (value === getValues().pass) {
                  return true;
                } else {
                  return "This doesn't match your password";
                }
              },
            })}
          />
        </Grid>
        <Grid item={true} xs={12}>
          <Button
            variant="contained"
            color="primary"
            size="large"
            type="submit"
            disabled={pending}
            fullWidth={true}
          >
            {!pending && <span>Save</span>}

            {pending && <CircularProgress size={28} />}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default SettingsPassword;
