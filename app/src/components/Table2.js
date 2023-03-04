import * as React from 'react';
import PropTypes from 'prop-types';
import { alpha } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Checkbox from '@mui/material/Checkbox';
import IconButton from '@mui/material/IconButton';
import Tooltip from '@mui/material/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DeleteIcon from '@mui/icons-material/Delete';
import FilterListIcon from '@mui/icons-material/FilterList';
import { visuallyHidden } from '@mui/utils';
import { abi, contract_address, rpc_url } from 'util/contract.js'
import {get_all_user_per_market, get_all_bets_per_bucket_per_user} from 'util/multicall.js'
import { useEffect, useState } from 'react';


let prediction_id = 0
if (typeof window !== 'undefined') {
	const url = window.location.href;
	const parts = url.split("?");
  prediction_id = parts[parts.length - 1]

  }
  const user_list = await get_all_user_per_market(rpc_url, contract_address, abi, prediction_id);
  console.log(user_list)

  
  const rows = [

  ];
  
  export default function BasicTable(props) {

    const [resultsUsersBets, setResultsUsersBets] = useState([])
    const options = props.options
    const optionKeys = Object.keys(options);

    console.log('options', options)  
  useEffect(() => {
    async function fetchBets() {
      const results = await get_all_bets_per_bucket_per_user(rpc_url, contract_address, abi, prediction_id, user_list);
      // do something with the result, such as updating state
      console.log('results', results)
      setResultsUsersBets(results);

    }
    fetchBets();
    console.log('bets' + resultsUsersBets)
    votes = resultsUsersBets

  }, [user_list]);
  let votes = resultsUsersBets

   
  const rows = Object.entries(resultsUsersBets).map(([address, options]) => {
    return {
      address: address,
      ...options,
    };
  });
  
    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Address</TableCell>
            {options?.map((option, index) => (
              <TableCell key={index} align="right">{option}</TableCell>
            ))}
          </TableRow>
        </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow
                key={row.name}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                {row.address}
              </TableCell>
              {optionKeys.map((key) => (
  <TableCell align="right" key={key}>
    {row[key]}
  </TableCell>
))}
            </TableRow>
          ))}
        </TableBody>
        </Table>
      </TableContainer>
    );
  }
  

  
 
  



