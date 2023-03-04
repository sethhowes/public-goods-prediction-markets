export function convertToDecimal(results) {
  const output = [];
  let result;
  for (let i = 0; i < results.committed_amount_bucket.length; i++) {
    result = parseInt(results.committed_amount_bucket[i].hex, 16);
    output.push(result);
  }
  return output;
}
