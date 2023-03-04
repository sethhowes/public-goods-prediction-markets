import React, { useState, useContext } from "react";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";
import Toolbar from "@mui/material/Toolbar";
import Link from "next/link";
import Button from "@mui/material/Button";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import NightsStayIcon from "@mui/icons-material/NightsStay";
import WbSunnyIcon from "@mui/icons-material/WbSunny";
import MenuIcon from "@mui/icons-material/Menu";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Section from "components/Section";
import { useAuth } from "util/auth";
import { useTheme } from "@mui/styles";
import { ConnectButton } from '@rainbow-me/rainbowkit';


function Navbar2(props) {
  const theme = useTheme();
  const auth = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [menuState, setMenuState] = useState(null);
  const [walletAddress, setWalletAddress] = useState("");

  // Use inverted logo if specified
  // and we are in dark mode
  const logo =
    props.logoInverted && theme.name === "dark"
      ? props.logoInverted
      : props.logo;

  const handleOpenMenu = (event, id) => {
    // Store clicked element (to anchor the menu to)
    // and the menu id so we can tell which menu is open.
    setMenuState({ anchor: event.currentTarget, id });
  };

  const handleCloseMenu = () => {
    setMenuState(null);
  };

  return (
    <Section bgColor={props.color} size="auto">
      <AppBar position="static" color="transparent" elevation={0}>
        <Container disableGutters={true}>
          <Toolbar>
            <Link href="/">
              <a>
                <Box
                  component="img"
                  src={logo}
                  alt="Logo"
                  sx={{ height: 28 }}
                />
              </a>
            </Link>
            <Box sx={{ ml: 2, display: { md: "block", xs: "none" } }}>
            <Link href="/viewall" passHref={true}>
                <Button color="inherit" component="a">
                  Dashboard{" "}
                </Button>
              </Link>
              <Link href="/dashboard?0" passHref={true}>
                <Button component="a" color="inherit">
                  Predict
                </Button>
              </Link>
              <Link href="/makeprediction" passHref={true}>
                <Button component="a" color="inherit">
                  Create{" "}
                </Button>
              </Link>
              <Link href="/stake" passHref={true}>
                <Button component="a" color="inherit">
                  Stake{" "}
                </Button>
              </Link>
              

            </Box>
            <IconButton
              onClick={() => setDrawerOpen(true)}
              color="inherit"
              size="large"
              sx={{ ml: "auto", display: { md: "none", xs: "block" } }}
            >
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", ml: "auto", mr: "10px", }}>
            
                    <ConnectButton/>
               
                

             

              <IconButton
                color="inherit"
                onClick={theme.toggle}
                style={{ opacity: 0.6 }}
                size="large"
              >
                {theme.name === "dark" && <NightsStayIcon />}

                {theme.name !== "dark" && <WbSunnyIcon />}
              </IconButton>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List onClick={() => setDrawerOpen(false)} sx={{ width: "250px" }}>
        <Link href="/viewall" passHref={true}>
                <Button component="a" color="inherit">
                  Dashboard{" "}
                </Button>
              </Link>
              <Link href="/dashboard" passHref={true}>
                <Button component="a" color="inherit">
                  Predict
                </Button>
              </Link>
              <Link href="/makeprediction" passHref={true}>
                <Button component="a" color="inherit">
                  Create
                </Button>
              </Link>

         
         


         

          <ListItem>
            <IconButton
              color="inherit"
              onClick={theme.toggle}
              style={{ opacity: 0.6 }}
              size="large"
            >
              {theme.name === "dark" && <NightsStayIcon />}

              {theme.name !== "dark" && <WbSunnyIcon />}
            </IconButton>
          </ListItem>
        </List>
      </Drawer>
    </Section>
  );
}

export default Navbar2;
