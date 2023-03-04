export function getMeansOverTime(betAmounts, betBuckets) {
    const numberOfBets = betAmounts;
    const quotient = Math.floor(numberOfBets / 6); // calculate the quotient
    const remainder = numberOfBets % 6; // calculate the remainder
    const result = new Array(6).fill(quotient); // create an array of equal parts
    let previousMean;
    let runningTotal = 0;

    console.log([...Array(40)].map(e=>~~(Math.random()*40)))

    // for (let i = 0; i < remainder; i++) {
    //     result[i]++;
    //   }

    // for (let i = 0; i < result.length; i++) {
    //     runningTotal += result[i];
    //     result[i] = runningTotal;
    // }

    // // Output: [225, 450, 675, 899, 1123, 1347]
    
    // // Create empty array same size as buckets
    // runningTotal = new Array(betBuckets.length);

    //  // Create empty array of 6 
    //  const means = new Array(6);

    //  for (let i = 0; i < result.length; i++) {
    //     for (let j = 0; j < result[i]; j++) {
    //         runningTotal += betAmounts[i] * betBuckets[i];
    //     }
    //     means = runningTotal / result[i];
    //     runningTotal = 0;
    //  }
    //  return means;
    }