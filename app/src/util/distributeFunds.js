export function distributeFunds(num, bucketNumber) {

  // Divide the initial integer into three equal parts
  const part = Math.floor(num / bucketNumber);

  // Calculate the remaining amount
  const remainder = num % bucketNumber;

  // Create an array to store the integers
  const integers = [];

  for (let i = 0; i < (bucketNumber - 1); i++) {
    integers.push(part);
  }
  
  // Add the final integer
  integers.push(part + remainder);

  return integers;
  
}