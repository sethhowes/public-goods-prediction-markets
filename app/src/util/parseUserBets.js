export function parseUserBets(userBets) {
    let totalCommitted = 0;
    for (const key in userBets) {
        totalCommitted += userBets[key]
    }
    console.log(totalCommitted)
    return totalCommitted;
}