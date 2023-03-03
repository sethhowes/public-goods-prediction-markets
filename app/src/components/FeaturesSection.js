import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TravelExploreIcon from '@mui/icons-material/TravelExplore';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import Section from "components/Section";

function FeaturesSection(props) {
  const items = [
    {
      title: "Predict",
      description:
        "Experts can make predictions",
      icon: AutoGraphIcon,
      iconColor: "#1EBEA5",
    },
    {
      title: "Learn",
      description:
        "Find answers to the world's toughest questions.",
      icon: TravelExploreIcon,
      iconColor: "#00A8E6",
    },
    {
      title: "Earn",
      description:
        "Make money by predicting the future",
      icon: CurrencyExchangeIcon,
      iconColor: "#157AFB",
    },
  ];

  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <Grid container={true} alignItems="center" spacing={8}>
          <Grid container={true} item={true} direction="column" xs={12} md={6}>
            <Box
              component="figure"
              sx={{
                margin: "0 auto",
                maxWidth: "670px",
                width: "100%",
                "& > img": {
                  width: "100%",
                },
              }}
            >
             <img
        src="images/screenshot.png"
        alt=""
        style={{ borderRadius: '10px' }}
      />
            </Box>
          </Grid>
          <Grid item={true} xs={12} md={6}>
            {items.map((item, index) => (
              <Grid
                item={true}
                container={true}
                direction="row"
                justifyContent="center"
                alignItems="center"
                spacing={5}
                key={index}
                sx={{
                  // Spacing between rows
                  "&:not(:last-child)": {
                    mb: 3,
                  },
                }}
              >
                <Grid item={true} xs="auto">
                  <Box
                    sx={{
                      color: item.iconColor,
                      display: "flex",
                      justifyContent: "center",
                      fontSize: "70px",
                      width: "70px",
                      height: "70px",
                    }}
                  >
                    <item.icon fontSize="inherit" />
                  </Box>
                </Grid>
                <Grid item={true} xs={true}>
                  <Typography variant="h5" gutterBottom={true}>
                    {item.title}
                  </Typography>
                  <Typography variant="subtitle1">
                    {item.description}
                  </Typography>
                </Grid>
              </Grid>
            ))}
          </Grid>
        </Grid>
      </Container>
    </Section>
  );
}

export default FeaturesSection;