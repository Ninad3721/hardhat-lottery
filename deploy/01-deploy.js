
const { network } = require("hardhat")
const { development, networkconfig } = require("../hardhat-helper-config");
const { ethers } = require("hardhat");
const bignumber = require("bignumber.js")
const FUND_AMOUNT = ethers.utils.parseEther("2") 

module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    let VRFCoordinatorV2address, subscriptionId,VRFCoordinatorV2Mocks
    if (development.includes(network.name)) {
        console.log("ChainId = 31337 is true")
        VRFCoordinatorV2Mocks = await ethers.getContract("VRFCoordinatorV2Mock")
        VRFCoordinatorV2address = VRFCoordinatorV2Mocks.address
        const transactionResponse = await VRFCoordinatorV2Mocks.createSubscription()
        const trasactionRecepiet = await transactionResponse.wait()
        subscriptionId = trasactionRecepiet.events[0].args.subId
        await VRFCoordinatorV2Mocks.fundSubscription(subscriptionId, FUND_AMOUNT)
    }
    else {
        VRFCoordinatorV2address =  networkconfig[chainId]["VRFCoordinatorV2"]
        subscriptionId = networkconfig[chainId]["subscriptionId"]

    } 
    const gas_lane = networkconfig[chainId]["gas_lane"]
    const entranceFee = networkconfig[chainId]["entranceFee"]
    const interval = networkconfig[chainId]["interval"]
    const callbackGasLimit = networkconfig[chainId]["callbackGasLimit"]
    const Lottery = await deploy("Lottery", {
        from: deployer,
        log: true,
        args: [VRFCoordinatorV2address, entranceFee, gas_lane, callbackGasLimit, subscriptionId, interval],
        waitConfirmation: network.config.waitBlockConfirmation || 1,

    }
    )
    await log("contract deployed" + Lottery.address)

}


module.exports.tags = ["all", "goerli"]