import { ethers } from 'ethers';

export function parseQuoteResult(result, stake) {
    result[0] = result[0].toPrecision(3)
    if (result[0] == 0) {
        result[0] = 0.001;
    }
    if (result[1] == Infinity) {
        result[1] = 1000 // Maximum payoff
    } else {
        result[1] = result[1].toFixed(2)
    }

    result[1] = (result[1] * stake) / 1e18 + (stake / 1e18);
    result[1] = result[1].toPrecision(2)
    return result;
}