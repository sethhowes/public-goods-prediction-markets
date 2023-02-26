import React from "react";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Link from "next/link";
import Section from "components/Section";

function Announcement(props) {
  const {
    onClose,
    bgColor,
    textColor,
    text,
    buttonColor,
    buttonPath,
    buttonText,
    ...otherProps
  } = props;

  return (
    <Section bgColor={bgColor} size="auto" {...otherProps}>
      <Alert
        icon={false}
        onClose={onClose}
        sx={{
          // Let parent <Section> handle colors
          backgroundColor: "transparent",
          color: "inherit",
          // Customize message element
          "& .MuiAlert-message": {
            width: "100%",
            textAlign: "center",
          },
        }}
      >
        {text}
        <Link href={buttonPath} passHref={true}>
          <Button
            component="a"
            variant="contained"
            color={buttonColor}
            size="medium"
            sx={{ ml: 2 }}
          >
            {buttonText}
          </Button>
        </Link>
      </Alert>
    </Section>
  );
}

export default Announcement;
