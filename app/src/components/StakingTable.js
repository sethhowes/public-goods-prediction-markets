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


function Row(props) {
  const { row } = props;
  const [open, setOpen] = React.useState(false);

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
                    <TableCell>Date</TableCell>
                    <TableCell>Market</TableCell>
                    <TableCell align="right">Prediction</TableCell>
                    <TableCell align="right">Copy</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {row.history.map((historyRow) => (
                    <TableRow key={historyRow.date}>
                      <TableCell component="th" scope="row">
                        {historyRow.date}
                      </TableCell>
                      <TableCell>{historyRow.customerId}</TableCell>
                      <TableCell align="right">{historyRow.amount}</TableCell>

                      <TableCell align="right">{historyRow.amount3}</TableCell>

                      <TableCell align="right">
                        {" "}
                        <a href="https://example.com">
                          <span role="img" aria-label="rocket ship">
                            🚀
                          </span>
                        </a>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

export default function StakingTable(props) {
    const [search, setSearch] = React.useState("");
 const userList = props.userList
   const rows = userList.map((user) => (
    {
      id: 1,
      Address: user,
      Trades: 17,
      history: [
        {
          date: "2020-01-05",
          customerId: "What was the climate?",
          amount: "30 on 4c"
        },
        {
          date: "2020-01-02",
          customerId: "What was the temperature in 22?",
          amount: "20 on 6c"
        }
      ]
    }
    ));
    // add more rows with a history property as needed
 


  return (
    <TableContainer component={Paper}>
        <TextField
        label="Search"
        variant="outlined"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        mb = {2}
      />
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell />
            <TableCell>Address</TableCell>
            <TableCell>Trades</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
  {rows
    .filter(
      (row) =>
        row.Address?.toLowerCase().includes(search.toLowerCase()) ||
        row.Trades.toString().includes(search.toLowerCase())
    )
    .map((row) => (
      <Row key={row.name} row={row} />
    ))}
</TableBody>
      </Table>
    </TableContainer>
  );
}
