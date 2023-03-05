import * as React from "react";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import EnhancedTable from "components/Table2";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import Button from "@mui/material/Button";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { contract } from "../util/contract";
import { useSigner } from "wagmi";
import { useAccount } from 'wagmi';
import Popover from '@mui/material/Popover';
import { DriveEtaTwoTone } from "@mui/icons-material";
import { useNetwork } from 'wagmi'



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          <Typography component={"span"}>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

export default function ColorTabs(props) {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [value, setValue] = React.useState(0);
  const classes = props.useStyles();
  const { data: signer, isError, isLoading } = useSigner();
  const { chain, chains } = useNetwork()

  const [anchorEl, setAnchorEl] = React.useState(null);

  const handlePopoverOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);


  const handleCloseMarket = async () => {
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.closeMarket(3); //@todo Change hardcoded prediction id
  };

  const handleClaimFunds = async() => {
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.claimFunds(2); //@todo Change hardcoded prediction id
  }

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };
  const committedUserCapital = 3

  return (
    <Box sx={{ width: "100%" }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <Tab label="Overview" />
        <Tab label="Previous bets" />
        
      </Tabs>
      <TabPanel value={value} index={1}>
        <Box mb={2} sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
          Prediction History
        </Box>
        <Box sx={{ mt: 8 }}>
          <EnhancedTable options = {props.options} predictionUsers = {props.predictionUsers} unit = {props.unit} />
        </Box>
      </TabPanel>
   
      <TabPanel value={value} index={0}>
        <Box sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
          Current Prediction Details
        </Box>
        <Table>
          <TableBody>
          <TableRow>
              <TableCell>Creator Address</TableCell>
              <TableCell align="right">
                {props.creatorAddress}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>My Committed Capital</TableCell>
              <TableCell align="right">
                {props.totalCommitted} {chain?.nativeCurrency.symbol}
              </TableCell>
            </TableRow>
            {(props.creatorAddress == address) ?
            (<TableRow>
              <TableCell>Close Market</TableCell>
              <TableCell align="right">
              <div
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                >
                <Button disabled={parseInt(props.deadline?.hex, 16) > Date.now() / 1000 ? true : false}
 variant="contained" color="error" onClick={handleCloseMarket}>
                  Close Market 
                </Button>
                </div>
              </TableCell>
            </TableRow>) : (<></>)}
            <TableRow>
              <TableCell>Claim Funds</TableCell>
              <TableCell align="right">
                <div
                aria-owns={open ? 'mouse-over-popover' : undefined}
                aria-haspopup="true"
                onMouseEnter={handlePopoverOpen}
                onMouseLeave={handlePopoverClose}
                >
                <Button
                disabled={parseInt(props.deadline?.hex, 16) > Date.now() / 1000 ? true : false}
                variant="contained"
                color="error"
                onClick={handleClaimFunds}>
                  Claim Funds 
                </Button>
                </div>
                {(parseInt(props.deadline?.hex, 16) > Date.now() / 1000) ?
                (<Popover
        id="mouse-over-popover"
        sx={{
          pointerEvents: 'none',
        }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
      >

        <Typography sx={{ p: 1 }}>The prediction deadline has not passed.</Typography>
      </Popover>) : <></>
}
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TabPanel>
    </Box>
  );
}
