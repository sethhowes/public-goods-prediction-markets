import React from "react";
import Alert from "@mui/material/Alert";
import MuiLink from "@mui/material/Link";
import Link from "next/link";
import Section from "components/Section";

function Announcement2(props) {
  const {
    onClose,
    bgColor,
    textColor,
    text,
    linkPath,
    linkText,
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
        <Link href={linkPath} passHref={true}>
          <MuiLink sx={{ ml: 2 }}>{linkText}</MuiLink>
        </Link>
      </Alert>
    </Section>
  );
}

export default Announcement2;
