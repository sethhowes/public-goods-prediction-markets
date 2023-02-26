import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import EnhancedTable from 'components/Table'
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import Button from "@mui/material/Button";

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
          <Typography>{children}</Typography>
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
        <EnhancedTable />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <Typography>Tab Two Content</Typography>
      </TabPanel>
      <TabPanel value={value} index={2}>
        <Box>
        <Typography>
        <Box display="flex" alignItems="center">
              <AccountBalanceWalletIcon />

              <Typography sx={{ fontWeight: 'bold', marginLeft: 2 }}>
    <strong style={{ fontWeight: 'bold', padding: 3, ML: 5}}>My Commited Capital:</strong>
  </Typography>
  <Typography sx={{ fontWeight: 'bold', marginLeft: 2 }} className={classes.gradientText}>
    3 ETH 
  </Typography>
   (100%)
</Box>
        </Typography>
        </Box>
        <Box sx={{MT:10}}>
        <Button> Close Market </Button>
        </Box>
      
      </TabPanel>
    </Box>
  );
}
