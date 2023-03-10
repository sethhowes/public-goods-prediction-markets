import { contract } from "./contract";

export async function getHistoricalBetAmounts(predictionId) {
  const pastBetAmounts = await contract.viewBetAmounts(predictionId);
  return pastBetAmounts;
}

export async function getHistoricalBetTimestamps(predictionId) {
  const pastBetTimestamps = await contract.viewBetTimestamps(predictionId);
  return pastBetTimestamps;
}

export async function getHistoricalBetBuckets(predictionId) {
  const pastBetBuckets = await contract.getBetBucketIndex(predictionId);
  return pastBetBuckets;
}
