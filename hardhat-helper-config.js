const { ethers, utils } = require("ethers")

const networkconfig = {
    5:
    {
        VRFCoordinatorV2: "0x2ca8e0c643bde4c2e08ab1fa0da3401adad7734d",
        name: "goerli",
        entranceFee: ethers.utils.parseEther("0.01"),
        gas_lane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        interval: "30",
        subscriptionId: "7579"
    },
    31337:
    {
        name: "localhost",
        subscriptionId: "7579",
        entranceFee: ethers.utils.parseEther("0.01"),
        gas_lane: "0x79d3d8832d904592c0bf9818b621522c988bb8b0c05cdc3b15aea1b6e8db0c15",
        callbackGasLimit: "500000",
        interval: "30",


    }
}

const development = ["localhost", "hardhat"]
module.exports = {
    networkconfig,
    development
}