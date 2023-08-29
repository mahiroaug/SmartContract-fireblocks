require('dotenv').config({ path: '.env'});

require("@nomicfoundation/hardhat-toolbox");
require("@fireblocks/hardhat-fireblocks");
//const { ApiBaseUrl } = require("@fireblocks/fireblocks-web3-provider");

const fs = require('fs');
const path = require('path');
const fb_apiSecret = fs.readFileSync(path.resolve("fireblocks_secret_SIGNER.key"), "utf8");



/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: "0.8.17",
  networks: {
    goerli: {
      url: "https://rpc.ankr.com/eth_goerli",
      fireblocks: {
        //apiBaseUrl: process.env.FIREBLOCKS_URL,
        privateKey: fb_apiSecret,
        apiKey: process.env.FIREBLOCKS_API_KEY_SIGNER,
        vaultAccountIds: process.env.FIREBLOCKS_VAULT_ACCOUNT_ID,
      }
    },
  },
};