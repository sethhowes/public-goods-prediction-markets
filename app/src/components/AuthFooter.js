import React from "react";
import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import Link from "next/link";

function AuthFooter(props) {
  return (
    <Box
      sx={{
        fontSize: "0.9rem",
        textAlign: "center",
        mt: 3,
        px: 2,
      }}
    >
      {props.type === "signup" && (
        <>
          {props.showAgreement && (
            <Box sx={{ mb: 2 }}>
              By signing up, you are agreeing to our{" "}
              <Link href={props.termsPath} passHref={true}>
                <MuiLink>Terms of Service</MuiLink>
              </Link>{" "}
              and{" "}
              <Link href={props.privacyPolicyPath} passHref={true}>
                <MuiLink>Privacy Policy</MuiLink>
              </Link>
              .
            </Box>
          )}

          {props.signinText}
          <Link href={props.signinPath} passHref={true}>
            <MuiLink sx={{ ml: 1 }}>{props.signinAction}</MuiLink>
          </Link>
        </>
      )}

      {props.type === "signin" && (
        <>
          <Link href={props.signupPath} passHref={true}>
            <MuiLink>{props.signupAction}</MuiLink>
          </Link>

          {props.forgotPassAction && (
            <>
              <Link href={props.forgotPassPath} passHref={true}>
                <MuiLink sx={{ ml: 2 }}>{props.forgotPassAction}</MuiLink>
              </Link>
            </>
          )}
        </>
      )}

      {props.type === "forgotpass" && (
        <>
          {props.signinText}
          <Link href={props.signinPath} passHref={true}>
            <MuiLink sx={{ ml: 1 }}>{props.signinAction}</MuiLink>
          </Link>
        </>
      )}
    </Box>
  );
}

export default AuthFooter;
