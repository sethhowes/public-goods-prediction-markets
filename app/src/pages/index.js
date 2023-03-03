import React from "react";
import HeroSection from "components/HeroSection";
import FeaturesSection from "components/FeaturesSection";
import ContentCardsSection from "components/ContentCardsSection";
import StatsSection from "components/StatsSection";
import { makeStyles } from "@mui/styles";
function IndexPage(props) {
  const useStyles = makeStyles((theme) => ({
    gradientText: {
      backgroundClip: "text",
      backgroundImage:
        "linear-gradient(85.9deg, #1EBEA5 -14.21%, #00B5C4 18.25%, #00A8E6 52.49%, #0096FD 81.67%, #157AFB 111.44%)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
    },
  }));
  return (
    <>
    <HeroSection
    bgColor="primary"
    size="medium"
    bgImage=""
    bgImageOpacity={1}
    title="Get answers to the world's toughest questions"
    subtitle="Access verified predictions from the world's top experts."
    image=""
    buttonText="Get Started"
    buttonColor="secondary"
    buttonPath="/pricing"
    useStyles = {useStyles}
  />
  <StatsSection
    bgCgit olor="default"
    size="medium"
    bgImage=""
    bgImageOpacity={1}
    useStyles = {useStyles}
  />
  <FeaturesSection
    bgColor="primary"
    size="medium"
    bgImage=""
    bgImageOpacity={1}
    title="Features"
  />

  <ContentCardsSection
    bgColor="default"
    size="medium"
    bgImage=""
    bgImageOpacity={1}
    title="Trending Categories"
    subtitle=""
  />
  
  </>
  );
}

export default IndexPage;
