import { ethers } from "ethers";
import { abi as contractABI } from "../../public";

const contractAddress = "0x6f298210E6696F508650CE232D087FD31cb84C7A";

export default function closeMarket(predictionId) {
  // Create contract object
  const contract = new ethers.Contract(contractAddress, contractABI);
  // Connect to Metamask provider
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contractWithSigner = contract.connect(signer);
  const tx = contractWithSigner.closeMarket(predictionId);
  return tx;
}
