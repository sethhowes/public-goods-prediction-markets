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
import {contract} from "../util/contract";
import { useSigner } from "wagmi";

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
  const [value, setValue] = React.useState(0);
  const classes = props.useStyles();
  const { data: signer, isError, isLoading } = useSigner();
  const handleCloseMarket = async () => {
    const contractWithSigner = contract.connect(signer);
    const tx = await contractWithSigner.closeMarket(3);
  };

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
        <Tab label="Details" />
        <Tab label="History" />
        
      </Tabs>
      <TabPanel value={value} index={1}>
        <Box mb={2} sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
          Prediction History
        </Box>
        <Box sx={{ mt: 8 }}>
          <EnhancedTable options = {props.options} predictionUsers = {props.predictionUsers} />
        </Box>
      </TabPanel>
   
      <TabPanel value={value} index={0}>
        <Box sx={{ fontWeight: "bold", marginBottom: "1rem" }}>
          Details
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
                {committedUserCapital} ETH {/* @todo change this from being hardcoded */}
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Close Market</TableCell>
              <TableCell align="right">
                <Button disabled={props.userAddress === props.creatorAddress ? false : true}
 variant="contained" color="error" onClick={handleCloseMarket}>
                  Close Market 
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </TabPanel>
    </Box>
  );
}
