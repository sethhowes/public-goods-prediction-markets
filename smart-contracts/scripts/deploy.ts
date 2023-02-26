import { ethers } from "hardhat";

async function main() {
  const sciPredictContractFactory = await ethers.getContractFactory("SciPredict");
  const sciPredict = await sciPredictContractFactory.deploy()
  await sciPredict.deployed();
  console.log(`Deployed at ${sciPredict.address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
