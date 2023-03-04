import * as React from "react";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import Paper from "@mui/material/Paper";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import TextField from "@mui/material/TextField"; // import TextField
import { useSigner } from 'wagmi';
import { stakingContract } from "util/stakingContract";

function Row(props) {
    const { row, betList } = props
    const [open, setOpen] = React.useState(false);

    const { data: signer, isError, isLoading } = useSigner();

    const handleCopy = (async () => {
      const contractWithSigner = stakingContract.connect(signer);
      const tx = await contractWithSigner.copyBet("0xf2B719136656BF21c2B2a255F586afa34102b71d", 0, 1, {value: 20}); // address, predictionId, bucketIndex, value
    })
    return (
      <React.Fragment>
        <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
          <TableCell>
            <IconButton
              aria-label="expand row"
              size="small"
              onClick={() => setOpen(!open)}
            >
              {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
            </IconButton>
          </TableCell>
          <TableCell component="th" scope="row">
            {row.Address}
          </TableCell>
          <TableCell align="left">{row.Trades}</TableCell>
        </TableRow>
        <TableRow>
  <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
    <Collapse in={open} timeout="auto" unmountOnExit>
      <Box sx={{ margin: 1 }}>
        <Typography variant="h6" gutterBottom component="div">
          Prediction History
        </Typography>
        <Table size="small" aria-label="purchases">
          <TableHead>
            <TableRow>
              <TableCell>Market</TableCell>
              <TableCell align="right">Prediction</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
              <TableRow >
                <TableCell>Market</TableCell>
                <TableCell align="right">Prediction</TableCell>
                <TableCell align="right">
                  {" "}
                  <a onClick={handleCopy}>
                    <span role="img" aria-label="rocket ship">
                      🚀
                    </span>
                  </a>
                </TableCell>
              </TableRow>
       
          </TableBody>
        </Table>
      </Box>
    </Collapse>
  </TableCell>
</TableRow>
      </React.Fragment>
    );
  }

//
/* (2) [{…}, {…}]
0: 
0x52Bdc5B6f89A95b1e8171ee21090b428ea01C5d6 : {0: 0, 1: 1, 2: 0, 3: 0}
0xf2B719136656BF21c2B2a255F586afa34102b71d: {0: 0, 1: 1999999000000000, 2: 0, 3: 0}
1: 
0x52Bdc5B6f89A95b1e8171ee21090b428ea01C5d6: {0: 0, 1: 0, 2: 0, 3: 0}
0xf2B719136656BF21c2B2a255F586afa34102b71d: {0: 0, 1: 2000, 2: 0, 3: 0} */

export default function StakingTable(props) {
    const [search, setSearch] = React.useState("");
 const userList = props.userList
 const betList = props.betList
 const rows = userList.map((user) => ({
    id: 1,
    Address: user,
    Trades: "0",
    history: [],
  }));
  
  return (
    <TableContainer component={Paper}>
      <TextField
        label="Search"
        variant="outlined"
        size="small"
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Address</TableCell>
            <TableCell align="left">Trades</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows
            .filter((row) => row.Address.toLowerCase().includes(search.toLowerCase()))
            .map((row) => (
              <Row key={row.Address} row={row} betList={betList} />
            ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
 


            }