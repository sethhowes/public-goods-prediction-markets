export function distributeFunds(num) {

  // Divide the initial integer into three equal parts
  const part = Math.floor(num / 3);

  // Calculate the remaining amount
  const remainder = num % 3;

  // Create an array to store the three integers
  const integers = [];

  // Add the first integer
  integers.push(part);

  // Add the second integer
  integers.push(part);

  // Add the third integer
  integers.push(part + remainder);

  return integers;
  
}
