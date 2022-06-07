const { ethers } = require("hardhat")
const { ChivNFTs_CONTRACT_ADDRESS } = require("../constants")

async function main() {

  const chivNFTsContract = ChivNFTs_CONTRACT_ADDRESS

  const ChivCoinContract = await ethers.getContractFactory("ChivCoin")
  const deployedChivCoinContract = await ChivCoinContract.deploy(chivNFTsContract)

  console.log("ChivCoin contract address: ", deployedChivCoinContract.address)
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })