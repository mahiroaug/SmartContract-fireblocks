// web3-provider for fireblocks

require('dotenv').config({ path: '.env'});

const fs = require('fs');
const path = require('path');
const { inspect } = require('util');
const Web3 = require("web3");
const { FireblocksWeb3Provider, ChainId } = require("@fireblocks/fireblocks-web3-provider")
const { toASCII } = require('punycode');

//// common environment
const network = process.env.NETWORK;
const COIN_CA = process.env.COIN_CA_OWNED_SIGNER;
const COIN_ABI = require('../artifacts/contracts/MahiroCoin.sol/MahiroCoin.json').abi;

//// fireblocks
const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret_SIGNER.key"), "utf8");
const fb_apiKey = process.env.FIREBLOCKS_API_KEY_SIGNER
const fb_vaultId = process.env.FIREBLOCKS_VAULT_ACCOUNT_ID

const eip1193Provider = new FireblocksWeb3Provider({
    privateKey: fb_apiSecret,
    apiKey: fb_apiKey,
    vaultAccountIds: fb_vaultId,
    chainId: ChainId.GOERLI,
});

let web3FB;
let myAddrFB;
let signer_addressFB;
let CoinFB;


////// call functions /////////

async function getAccountBalance(address) {
    console.log(`Account: ${address}`);

    // ETH Balance
    const balance = await web3FB.eth.getBalance(address);
    console.log(`ETH Balance : ${web3FB.utils.fromWei(balance, 'ether')} ETH`);

    // MNBC Balance
    const coinBalance = await CoinFB.methods.balanceOf(address).call();
    console.log(`MahiroCoin Balance: ${web3FB.utils.fromWei(coinBalance, 'ether')} MNBC`);
}


////// send functions /////////

const sendTx = async (_to ,_tx ,_signer,_gasLimit) => {

    // check toAddress
    toAddress = web3FB.utils.toChecksumAddress(_to);
    console.log(' toAddress:',toAddress);

    // gasLimit
    const setGasLimit = _gasLimit;
    console.log(' setGasLimit:', setGasLimit);

    // gasPrice
    const gasPrice = await web3FB.eth.getGasPrice();
    const gasPriceInGwei = await web3FB.utils.fromWei(gasPrice, 'gwei');
    console.log(' gasPrice:', gasPrice,'(', gasPriceInGwei,'Gwei)');

    // estimate max Transaction Fee
    const estimateMaxTxFee = setGasLimit * gasPrice;
    const estimateMaxTxFeeETH = await web3FB.utils.fromWei(estimateMaxTxFee.toString(), 'ether');
    console.log(' estimate MAX Tx Fee:', estimateMaxTxFee, '(', estimateMaxTxFeeETH, 'ETH)');

/*
    // Sign Tx
    const createTransaction = await web3FB.eth.signTransaction(
        {
            to: toAddress,
            from: _signer,
            data: _tx.encodeABI(),
            gas: await web3FB.utils.toHex(setGasLimit)
        }
    );

    // Send Tx and Wait for Receipt
    const createReceipt = await web3FB.eth
        .sendSignedTransaction(createTransaction.rawTransaction)
        .once("transactionHash", (txhash) => {
            console.log(` Send transaction ...`);
            console.log(` https://${network}.etherscan.io/tx/${txhash}`);

        })
    console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);
*/


    const createReceipt = await web3FB.eth.sendTransaction({
        to: toAddress,
        from: _signer,
        data: _tx.encodeABI(),
        gas: await web3FB.utils.toHex(setGasLimit)
    }).once("transactionHash", (txhash) => {
        console.log(` Send transaction ...`);
        console.log(` https://${network}.etherscan.io/tx/${txhash}`);
    })
    console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);

    return(createReceipt);
}


// ETH送信Tx
async function sendETH(signerAddr, to, amount){
    try{
        const weiAmount = web3FB.utils.toWei(amount.toString(),"ether");
        const nonce = await web3FB.eth.getTransactionCount(signerAddr, 'latest');

        const createReceipt = await web3FB.eth.sendTransaction({
            to: to,
            from: signerAddr,
            value: weiAmount,
            gas: 30000,
            nonce: nonce,
        }).once("transactionHash", (txhash) => {
            console.log(` Send transaction ...`);
            console.log(` https://${network}.etherscan.io/tx/${txhash}`);
        })
        console.log(` Tx successful with hash: ${createReceipt.transactionHash} in block ${createReceipt.blockNumber}`);

    } catch(error){
        console.error("Error sending ETH:", error);
    }
}


(async() => {
  
    // initializer on fireblocks ////////////////////////////////////////////
    web3FB = new Web3(eip1193Provider);
    myAddrFB = web3FB.eth.getAccounts()
    CoinFB = new web3FB.eth.Contract(COIN_ABI, COIN_CA);


    // get Fireblocks vault accounts
    myAddrFB = await web3FB.eth.getAccounts();
    console.log('myAdderFB=',inspect(myAddrFB, false, null, true));
    signer_addressFB = myAddrFB[0]
    await getAccountBalance(signer_addressFB);


    // send ETH
    sendETH(signer_addressFB,process.env.METAMASK,0.00000123);


})().catch(error => {
    console.log(error)
});