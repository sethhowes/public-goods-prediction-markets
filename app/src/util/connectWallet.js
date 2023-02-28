import { ethers } from "ethers";


export async function connectWallet() {
    if (window.ethereum) {
      try {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
          console.log("TEST")
        const addressArray = await provider.send("eth_requestAccounts", []);
        return {
          address: addressArray[0],
        };
      } catch (err) {
        return {
          address: "",
        };
      }
    } else {
      return {
        address: "",
      };
    }
  }