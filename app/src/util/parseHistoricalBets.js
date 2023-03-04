export function parseHistoricalBets(bet) {
    const betNumber = bet.length;
    const output = [];
    let number;
    for (let i = 0; i < betNumber; i++) {
        number = parseInt(bet[i]._hex, 16);
        output.push(number);
    }
    return output;
}