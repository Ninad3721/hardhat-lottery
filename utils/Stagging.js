const { assert } = require("chai")
const { development } = require("../hardhat-helper-congif")
const { network } = require("hardhat")
const { ethers } = require("ethers")

development.includes(network.name) ? describe.skip :
    let deployer, lotteryContract
describe("Lottery staging test", function () {
    this.beforeEach(async function () {
        deployer = (await getNameAccounts()).deployer
        lotteryContract = await ethers.getContractAt("Lottery", deployer)


    })
})