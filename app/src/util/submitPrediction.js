import { ethers } from "ethers";
import { abi as contractABI } from "../../public";

const contractAddress = "0x6f298210E6696F508650CE232D087FD31cb84C7A";

export default function submitPrediction(
  title,
  unit,
  buckets,
  rewardAmount,
  endDate,
  category,
  apiendpoint,
) {
  // Create contract object
  const contract = new ethers.Contract(contractAddress, contractABI);
  // Connect to Metamask provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractWithSigner = contract.connect(signer);
  const tx = contractWithSigner.createPrediction(
    title, // Prediction title
    unit, // Unit string
    1, // Increment unit
    buckets, // Array of outcomes
    rewardAmount,
    0, // Token address KEEP AS NULL FOR NOW
    "exponential", // Reward curve
    true, // Permissioned
    endDate,
    category,
    apiendpoint,
    { value: rewardAmount }
  );
  return tx;
}
