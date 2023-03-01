import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EnhancedTable from 'components/Table'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

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
          <Typography component={'span'} >{children}</Typography>
        </Box>
      )}
    </div>
  );
}



export default function ColorTabs(props) {
  const [value, setValue] = React.useState(0);
  const classes = props.useStyles();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  return (

    <Box sx={{ width: '100%' }}>
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="secondary"
        indicatorColor="secondary"
        aria-label="secondary tabs example"
      >
        <Tab label="History" />
        <Tab label="Redeem" />
        <Tab label="Adminstrator" />
    
      </Tabs>
      <TabPanel value={value} index={0}>
      <Box sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>Prediction History</Box>
      <Box sx={{ mt: -8 }}>
  <EnhancedTable />
</Box>
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography>Tab Two Content</Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
      <Box sx={{ fontWeight: 'bold', marginBottom: '1rem' }}>Adminstrate Market</Box>

    <Table>
      <TableBody>
      <TableRow>
          <TableCell>My Committed Capital</TableCell>
          <TableCell align="right">
            3 ETH
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell>Close Market</TableCell>
          <TableCell align="right">
            <Button variant="contained">Close Market</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
        
      </TabPanel>
    </Box>
  );
}
