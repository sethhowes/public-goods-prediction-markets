import { ethers } from "ethers";
import { abi as contractABI } from "../../../smart-contracts/artifacts/contracts/SciPredict.sol/SciPredict.json";

export default function predictionContract(signer) {
  console.log(contractABI);
  console.log(signer);
  
  }
 