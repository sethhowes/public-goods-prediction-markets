import React from "react";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardMedia from "@mui/material/CardMedia";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import Section from "components/Section";
import SectionHeader from "components/SectionHeader";

function ContentCardsSection(props) {
  const items = [
    {
      image: "https://source.unsplash.com/aHrxrT1q2h0/800x600",
      title: "Faucibus turpis in",
      body: "Purus semper eget duis at tellus at urna condimentum mattis. Non blandit massa enim nec.",
      url: "/post/golden-gate",
    },
    {
      image: "https://source.unsplash.com/BkmdKnuAZtw/800x600",
      title: "Faucibus turpis in",
      body: "Purus semper eget duis at tellus at urna condimentum mattis. Non blandit massa enim nec.",
      url: "/post/beach",
    },
    {
      image: "https://source.unsplash.com/HXJkqHexaak/800x600",
      title: "Faucibus turpis in",
      body: "Purus semper eget duis at tellus at urna condimentum mattis. Non blandit massa enim nec.",
      url: "/post/road",
    },
    {
      image: "https://source.unsplash.com/eOcyhe5-9sQ/800x600",
      title: "Faucibus turpis in",
      body: "Purus semper eget duis at tellus at urna condimentum mattis. Non blandit massa enim nec.",
      url: "/post/ballons",
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
        <SectionHeader
          title={props.title}
          subtitle={props.subtitle}
          size={4}
          sx={{ textAlign: "center" }}
        />
        <Grid container={true} justifyContent="center" spacing={4}>
          {items.map((item, index) => (
            <Grid item={true} xs={12} md={6} lg={3} key={index}>
              <Card>
                <Link href={item.url} passHref={true}>
                  <CardActionArea component="a">
                    <CardMedia
                      image={item.image}
                      title={item.title}
                      sx={{ height: "160px" }}
                    />
                    <CardContent>
                      <Typography
                        variant="h5"
                        component="h2"
                        gutterBottom={true}
                      >
                        {item.title}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        component="p"
                      >
                        {item.body}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Link>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Section>
  );
}

export default ContentCardsSection;
