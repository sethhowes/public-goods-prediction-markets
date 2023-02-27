import React, { useState } from "react";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { useForm } from "react-hook-form";
import { useAuth } from "util/auth";

function AuthForm(props) {
  const auth = useAuth();
  const [pending, setPending] = useState(false);
  const { handleSubmit, register, errors, getValues } = useForm();

  const submitHandlersByType = {
    signin: ({ email, pass }) => {
      return auth.signin(email, pass).then((user) => {
        // Call auth complete handler
        props.onAuth(user);
      });
    },
    signup: ({ email, pass }) => {
      return auth.signup(email, pass).then((user) => {
        // Call auth complete handler
        props.onAuth(user);
      });
    },
    forgotpass: ({ email }) => {
      return auth.sendPasswordResetEmail(email).then(() => {
        setPending(false);
        // Show success alert message
        props.onFormAlert({
          type: "success",
          message: "Password reset email sent",
        });
      });
    },
    changepass: ({ pass }) => {
      return auth.confirmPasswordReset(pass).then(() => {
        setPending(false);
        // Show success alert message
        props.onFormAlert({
          type: "success",
          message: "Your password has been changed",
        });
      });
    },
  };

  // Handle form submission
  const onSubmit = ({ email, pass }) => {
    // Show pending indicator
    setPending(true);

    // Call submit handler for auth type
    submitHandlersByType[props.type]({
      email,
      pass,
    }).catch((error) => {
      setPending(false);
      // Show error alert message
      props.onFormAlert({
        type: "error",
        message: error.message,
      });
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Grid container={true} spacing={2}>
        {["signup", "signin", "forgotpass"].includes(props.type) && (
          <Grid item={true} xs={12}>
            <TextField
              color="secondary"
              type="email"
              label="Email"
              name="email"
              placeholder="user@example.com"
              error={errors.email ? true : false}
              helperText={errors.email && errors.email.message}
              fullWidth={true}
              inputRef={register({
                required: "Please enter your email",
              })}
            />
          </Grid>
        )}

        {["signup", "signin", "changepass"].includes(props.type) && (
          <Grid item={true} xs={12}>
            <TextField
              type="password"
              color="secondary"

              label="Password"
              name="pass"
              error={errors.pass ? true : false}
              helperText={errors.pass && errors.pass.message}
              fullWidth={true}
              inputRef={register({
                required: "Please enter a password",
              })}
            />
          </Grid>
        )}

        {["signup", "changepass"].includes(props.type) && (
          <Grid item={true} xs={12}>
            <TextField
              type="password"
              color="secondary"

              label="Confirm Password"
              name="confirmPass"
              error={errors.confirmPass ? true : false}
              helperText={errors.confirmPass && errors.confirmPass.message}
              fullWidth={true}
              inputRef={register({
                required: "Please enter your password again",
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
        )}

        <Grid item={true} xs={12}>
          <Button
            variant="contained"
            sx={{
              backgroundImage: 'linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)',
              color: 'white',
              ml: 0,
            }}
            size="large"
            type="submit"
            disabled={pending}
            fullWidth={true}
          >
            {!pending && <span>{props.buttonAction}</span>}

            {pending && <CircularProgress size={28} />}
          </Button>
        </Grid>
      </Grid>
    </form>
  );
}

export default AuthForm;
