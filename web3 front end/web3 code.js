//Load web3 module
var Web3 = require('web3');

//Init web3 object
const web3 = new Web3(new Web3.providers.HttpProvider('http://localhost:8545')); //No real RPC required as no requests done

const contractAddress = '0x801e87c2fc19AF2A4e759cC55804264Ebf08a4c8'
const chain  = 'goerli';

//Main function wrapper
async function main(){
    //Get abi
    //Etherscan currently blocks requests from ultravity server --> overwrite ABI with local copy
    contractABI = [{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"guy","type":"address"},{"name":"wad","type":"uint256"}],"name":"approve","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"src","type":"address"},{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"wad","type":"uint256"}],"name":"withdraw","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint8"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"balanceOf","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"dst","type":"address"},{"name":"wad","type":"uint256"}],"name":"transfer","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"deposit","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"},{"name":"","type":"address"}],"name":"allowance","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"guy","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Approval","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"dst","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"src","type":"address"},{"indexed":false,"name":"wad","type":"uint256"}],"name":"Withdrawal","type":"event"}];

    //Init contract object
    const contract = new web3.eth.Contract(contractABI, contractAddress);

    //Print all functions in contract - required for drop down menu on front end
    console.log(contract.methods);

    const amount =  10 //web3.utils.toWei('1', 'ether'); possible to convert to other units here
    const functionName = 'withdraw';
    const functionArgs = [amount];
    //Encode function call - required as data argument for raw transaction
    const encodedFunctionCall = contract.methods[functionName](...functionArgs).encodeABI();
    console.log(encodedFunctionCall);
    
    //Build transaction object
    const from = '0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45'; //user account
    const value = '10';
    const to = contractAddress;
    const data = encodedFunctionCall;
    const gas = 1000000;
    // const gasPrice = '1000000000'; // 1 gwei // not required for ultravity api

    const rawTransaction = {
    from: from,
    to: to,
    data: data,
    gas: gas,
    value: value,
    }
    console.log(rawTransaction);
}


main();