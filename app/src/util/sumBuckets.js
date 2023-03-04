export function sumBuckets(bucketAmounts, num) {
    let totalCommitted = 0;
    for (let i = 0; i < num; i++) {
        totalCommitted += parseInt(bucketAmounts[i].hex, 16);
    }
    totalCommitted = (totalCommitted / 1e18).toPrecision(3);
    console.log(totalCommitted)
    return totalCommitted;
}