import React, { useState } from "react";
import Alert from "@mui/material/Alert";
import { useRouter } from "next/router";
import AuthSocial from "components/AuthSocial";

function Auth2(props) {
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
  );
}

export default Auth2;
