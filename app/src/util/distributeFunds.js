import { ethers } from "ethers";

export function distributeFunds(num, bucketNumber) {
  // Divide the initial integer into three equal parts
  let remainder = num;
  const part = num.div(bucketNumber);

  // Create an array to store the integers
  const integers = [];

  for (let i = 0; i < bucketNumber - 1; i++) {
    integers.push(part);
    remainder = remainder.sub(part)
  }

  // Add the final integer
  integers.push(remainder);

  return integers;
}
