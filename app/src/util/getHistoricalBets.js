import { ethers } from "ethers";
import contract from "./contract";

export default function getHistoricalBets(betAddress, predictionId) {

    // List all bets *from* myAddress
    return contract.filters.Bet(betAddress);
}
  
  