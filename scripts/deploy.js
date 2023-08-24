
require('@nomiclabs/hardhat-ethers');
require('@nomiclabs/hardhat-web3');
const hardhat = require('hardhat');

async function main() {
  const name = "MahiroCoinTest";
  const symbol = "MHRCT";

  const factory = await hardhat.ethers.getContractFactory("MahiroCoin");
  const contract = await factory.deploy(name,symbol);

  await contract.deployed();

  console.log("contract deployed to:", contract.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
})