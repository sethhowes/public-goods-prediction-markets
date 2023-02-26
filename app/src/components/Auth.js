import React, { useState } from "react";
import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/router";
import AuthForm from "components/AuthForm";
import AuthSocial from "components/AuthSocial";

function Auth(props) {
  const router = useRouter();
  const [formAlert, setFormAlert] = useState(null);

  const handleAuth = (user) => {
    router.push(props.afterAuthPath);
  };

  const handleFormAlert = (data) => {
    setFormAlert(data);
  };

  return (
    <>
      {formAlert && (
        <Alert severity={formAlert.type} sx={{ mb: 3 }}>
          {formAlert.message}
        </Alert>
      )}

      <AuthForm
        type={props.type}
        buttonAction={props.buttonAction}
        onAuth={handleAuth}
        onFormAlert={handleFormAlert}
      />

      {["signup", "signin"].includes(props.type) && (
        <>
          {props.providers && props.providers.length && (
            <>
              <Box sx={{ textAlign: "center", fontSize: "12px", my: 2 }}>
                OR
              </Box>
              <AuthSocial
                buttonAction={props.buttonAction}
                providers={props.providers}
                showLastUsed={true}
                onAuth={handleAuth}
                onError={(message) => {
                  handleFormAlert({
                    type: "error",
                    message: message,
                  });
                }}
              />
            </>
          )}
        </>
      )}
    </>
  );
}

export default Auth;
