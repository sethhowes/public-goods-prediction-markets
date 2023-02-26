import React, { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Alert from "@mui/material/Alert";
import Section from "components/Section";
import ReauthModal from "components/ReauthModal";
import SettingsNav from "components/SettingsNav";
import SettingsGeneral from "components/SettingsGeneral";
import SettingsPassword from "components/SettingsPassword";
import { useAuth } from "util/auth";

function SettingsSection(props) {
  const auth = useAuth();
  const [formAlert, setFormAlert] = useState(null);

  // State to control whether we show a re-authentication flow
  // Required by some security sensitive actions, such as changing password.
  const [reauthState, setReauthState] = useState({
    show: false,
  });

  const validSections = {
    general: true,
    password: true,
  };

  const section = validSections[props.section] ? props.section : "general";

  // Handle status of type "success", "error", or "requires-recent-login"
  // We don't treat "requires-recent-login" as an error as we handle it
  // gracefully by taking the user through a re-authentication flow.
  const handleStatus = ({ type, message, callback }) => {
    if (type === "requires-recent-login") {
      // First clear any existing message
      setFormAlert(null);
      // Then update state to show re-authentication modal
      setReauthState({
        show: true,
        // Failed action to try again after reauth
        callback: callback,
      });
    } else {
      // Display message to user (type is success or error)
      setFormAlert({
        type: type,
        message: message,
      });
    }
  };

  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      {reauthState.show && (
        <ReauthModal
          callback={reauthState.callback}
          provider={auth.user.providers[0]}
          onDone={() => setReauthState({ show: false })}
        />
      )}

      <SettingsNav activeKey={section} />
      <Container maxWidth="xs" sx={{ mt: 5 }}>
        {formAlert && (
          <Box sx={{ mb: 4 }}>
            <Alert severity={formAlert.type}>{formAlert.message}</Alert>
          </Box>
        )}

        {section === "general" && <SettingsGeneral onStatus={handleStatus} />}

        {section === "password" && <SettingsPassword onStatus={handleStatus} />}

      </Container>
    </Section>
  );
}

export default SettingsSection;
