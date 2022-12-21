const { development } = require("../hardhat-helper-config");
// 0.25 is this the premium in LINK?
const GAS_PRICE_LINK = 1e9 // link per gas, is this the gas lane? // 0.000000001 LINK per gas
const { network, ethers } = require("hardhat");
const { utils } = require("ethers");
const BASE_FEE = ethers.utils.parseEther("0.25") 

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { log, deploy } = deployments
    const { deployer } = await getNamedAccounts()
    console.log(network.config.chainId)
    const chainId = network.config.chainId
    if (chainId == 31337) {
        log("Test network detected.... Deploying mocks")
        await deploy("VRFCoordinatorV2Mock",
            {
                from: deployer,
                log: true,
                args: [BASE_FEE, GAS_PRICE_LINK],


            })
        log("Mock contract deployed ")

    }
}
module.exports.tags = ["all", "mocks"]