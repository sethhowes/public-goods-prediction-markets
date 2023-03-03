import { ethers } from "ethers";
import contract from "./contract";

export function getHistoricalBetsPerUser(betAddress, predictionId) {

    // List all bets *from* myAddress
    return contract.filters.Bet(betAddress);
}
  
export function getHistoricalBetsPerPrediction(predictionId) {

    return contract.filters.Bet(null, predictionId);
} 