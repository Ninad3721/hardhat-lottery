/** @type import('hardhat/config').HardhatUserConfig */
require("dotenv").config()
require("hardhat-deploy")
require("@nomiclabs/hardhat-waffle")

module.exports = {
  solidity: "0.8.17",
  defaultNetwork: "hardhat",
  networks:
  {
    goerli:
    {
      url: "https://eth-goerli.g.alchemy.com/v2/DUMqftJofufvzIoxXLk46iSMnA_zymBx",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 5,
    },
    mainnet:
    {
      url: "https://eth-mainnet.g.alchemy.com/v2/ZlZhkMbMMEKrEM2Wxb0oiFtceOEWcEbQ",
      accounts: process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
      chainId: 1,

    }
  },
  namedAccounts:
  {
    deployer: {
      default: 0, // here this will by default take the first account as deployer
      1: 0, // similarly on mainnet it will take the first account as deployer. Note though that depending on how hardhat network are configured, the account 0 on one network can be different than on another
    },
    player: {
      default: 1,
    },
  }
};