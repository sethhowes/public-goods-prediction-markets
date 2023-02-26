import React, { useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import AuthSocial from "components/AuthSocial";
import { useAuth } from "util/auth";

function ReauthModal(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const [formAlert, setFormAlert] = useState(null);

  const { register, handleSubmit, errors } = useForm();

  const onSubmit = (data) => {
    const { pass } = data;
    setPending(true);

    auth
      .signin(auth.user.email, pass)
      .then(() => {
        // Call failed action that originally required reauth
        props.callback();
        // Let parent know we're done so they can hide modal
        props.onDone();
      })
      .catch((error) => {
        // Hide pending indicator
        setPending(false);
        // Show error alert message
        setFormAlert({
          type: "error",
          message: error.message,
        });
      });
  };

  return (
    <Dialog open={true} onClose={props.onDone}>
      <DialogTitle>Please sign in again to complete this action</DialogTitle>
      <DialogContent
        sx={{
          // Ensures input label isn't hidden
          overflow: "visible",
        }}
      >
        {formAlert && (
          <Alert severity={formAlert.type} sx={{ mb: 4 }}>
            {formAlert.message}
          </Alert>
        )}

        {props.provider === "password" && (
          <form onSubmit={handleSubmit(onSubmit)}>
            <Grid container={true} spacing={2}>
              <Grid item={true} xs={12}>
                <TextField
                  type="password"
                  label="Password"
                  name="pass"
                  error={errors.pass ? true : false}
                  helperText={errors.pass && errors.pass.message}
                  fullWidth={true}
                  autoFocus={true}
                  inputRef={register({
                    required: "Please enter your password",
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
                  {!pending && <span>Submit</span>}

                  {pending && <CircularProgress size={28} />}
                </Button>
              </Grid>
            </Grid>
          </form>
        )}

        {props.provider !== "password" && (
          <AuthSocial
            type="signin"
            buttonText="Sign in"
            providers={[props.provider]}
            showLastUsed={false}
            onAuth={() => {
              props.callback();
              props.onDone();
            }}
            onError={(message) => {
              setFormAlert({
                type: "error",
                message: message,
              });
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}

export default ReauthModal;
