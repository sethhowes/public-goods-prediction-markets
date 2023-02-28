import { ethers } from "ethers";
// import {abi as contractABI} from "../../../smart-contracts/artifacts/contracts/SciPredict.sol/SciPredict.json";

const contractAddress = "0x9add861CE2D633c4E4Bfa7D2ef5e0904f7E9b5cc";

export default async function createWeb3Prediction(
    title,
    unit,
    buckets,
    rewardAmount,
    endDate,
    category,
    apiEndpoint
) {
  const provider = new ethers.providers.Web3Provider(window.ethereum)
  const signer = provider.getSigner();
  const contract = new ethers.Contract(
    contractAddress,
    contractABI.abi,
  );
  const contractWithSigner = contract.connect(signer);
  const tx = await contractWithSigner.createPrediction(
    title,
    unit,
    buckets,
    rewardAmount,
    0,
    "exponential",
    true,
    endDate,
    category,
    apiEndpoint,
    { value: rewardAmount }
  );
  return tx;

}
