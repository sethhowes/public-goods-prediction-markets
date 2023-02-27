import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";
import Typography from "@mui/material/Typography";

function HeroSection(props) {
    const classes = props.useStyles();

  return (
    <Section
      bgColor={props.bgColor}
      size={props.size}
      bgImage={props.bgImage}
      bgImageOpacity={props.bgImageOpacity}
    >
      <Container>
        <Grid container={true} alignItems="center" spacing={6}>
          <Grid container={true} item={true} direction="column" xs={12} md={6}>
            <Box sx={{ textAlign: { xs: "center", md: "left" } }}>
                <Box>
            <Typography variant="h4"  sx={{ fontWeight: "bold", mb: 4}} className={classes.gradientText} align="left">Get answers to the world's toughest questions
</Typography>
            <Typography variant="p"   align="left">Access verified predictions from the world's top experts.
</Typography>

             {/*  <SectionHeader
                title={props.title}
                subtitle={props.subtitle}
                size={4}
                className={classes.gradientText} 
              />
 */}</Box>
 <Box sx={{mt: 4}}>
              <Link href="/viewall" passHref={true}>
                <Button
                  variant="contained"
                  size="large"
                  sx={{
                    backgroundImage: 'linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)',
                    color: 'white',
                    ml: 0,
                  }}
                >
                  {props.buttonText}
                </Button>
              </Link>
              </Box>
            </Box>
          </Grid>
          <Grid item={true} xs={12} md={true}>
            <figure>
              <Box
                component="img"
                src={props.image}
                alt="illustration"
                sx={{
                  margin: "0 auto",
                  maxWidth: "570px",
                  display: "block",
                  height: "auto",
                  width: "100%",
                }}
              />
            </figure>
          </Grid>
        </Grid>
      </Container>
    </Section>
  );
}

export default HeroSection;