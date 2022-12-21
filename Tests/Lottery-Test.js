
const { assert, expect } = require("chai");
const { network, deployments, ethers } = require("hardhat")
const { development } = require("../hardhat-helper-congif");
console.log(network.name)
!development.includes(network.name) ? describe.skip : describe('Deploy on  ', async function () {

    let accounts, VRFCoordinatorV2Mock, lotteryContract, deployer, LotteryEntranceFee, interval
    beforeEach(async () => {
        // accounts = await ethers.getSigners()
        deployer = (await ethers.getNamedAccounts()).deployer
        await deployments.fixture(["all"]) // Deploys modules with the tags "mocks" and "raffle"
        VRFCoordinatorV2Mock = await ethers.getContract("VRFCordinatorV2Mock", deployer)
        lotteryContract = await ethers.getContract("Lottery", deployer)
        LotteryEntranceFee = await lotteryContract.LotteryEntranceFee()
        interval = await lotteryContract.getInterval()
    })
    describe("Constructor", async function () {
        it("intialize the Lottery contract", async () => {
            const lotteryState = (await lotteryContract.getLotteryState()).toString()
            assert.equal(lotteryState, 0)
        }
        )
    })

    describe("Enter the lottery", function () {
        it("Reverts if the given amt is less than entrance fee", async () => {
            await expect(lotteryContract.LotteryEntranceFee()).to.be.revertedWith(" notEnoughFee   ")
        }

        )
        it("Push the player to players array", async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            const playerFromCOntract = await lotteryContract.getPlayer(0)
            assert.equal(playerFromCOntract, deployer)
            it("emits event on enter", async () => {
                await expect(lottery.enterLottery()).to.emit(lottery, "EnterLottery")
            })

        })
    })

    describe("checkUpkeep", function () {
        it("doesnt allow Lottery when it is in calcculating state", async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]) //evm_increase time is used to fastforward the evm for a given amt of time
            await network.provider.send('evm_mine', [])//evm_mine
            await lotteryContract.perfromUpkeep([])
            await expect(lotteryContract.enterLottery({ value: LotteryEntranceFee }).to.be.revertedWith("lotteryStateNotOpen"))
        })
        it("perform Upkeeep", async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]) //evm_increase time is used to fastforward the evm for a given amt of time
            await network.provider.send('evm_mine', [])
            const { upKeepNeeded } = await lotteryContract.callStatic.checkUpkeep([])
            assert(!upKeepNeeded)
        })
        it("return if Lottery is not open", async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]) //evm_increase time is used to fastforward the evm for a given amt of time
            await network.provider.send('evm_mine', [])
            await lotteryContract.perfromUpkeep([])
            const lotteryState = await lotteryContract.getLotteryState()
            const { upKeepNeeded } = await lotteryContract.callStatic.checkUpkeep([])
            assert.expect(lotteryState.toString(), "1")
            assert.expect(!upKeepNeeded)
        })
    })

    describe("performUpkeep", function () {
        it("can only run when check upKeep is true", async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]) //evm_increase time is used to fastforward the evm for a given amt of time
            await network.provider.send('evm_mine', [])
            const tx = await lotteryContract.perfromUpkeep([])
            assert(tx)
        })
        it("reverts when checkup is false", async () => {
            await expect(lotteryContract.perfromUpkeep([]).to.be.revertedWith("LotteryUpkeepNotNeeded"))
        })
        it("updates the raffle state and emits a requestId", async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]) //evm_increase time is used to fastforward the evm for a given amt of time
            await network.provider.send('evm_mine', [])
            const txResponse = await lotteryContract.perfromUpkeep([])
            const txReceipt = await txResponse.wait(1)
            const raffleState = await lotteryContract.getLotteryState()
            const requestId = txReceipt.events[1].args.requestId
            assert(requestId.toNumber() > 0)
            assert(raffleState == 1)
        })
    })

    describe("fulfill Random words", function () {
        beforeEach(async () => {
            await lotteryContract.enterLottery({ value: LotteryEntranceFee })
            await network.provider.send('evm_increaseTime', [interval.toNumber() + 1]) //evm_increase time is used to fastforward the evm for a given amt of time
            await network.provider.send('evm_mine', [])
        })
        it("picks winner,resets and send money", async () => {
            for (let i = 2; i < 5; i++) {
                lottery = lotteryContract.connect(accounts[i])
                await lottery.enterLottery({ value: LotteryEntranceFee })
            }
            const StartingTimeStamp = await lotteryContract.getLastTimeStamp()
            await new Promise(async (resolved, rejected) => {
                lottery.once("WinnerPicked", async () => {
                    console.log("Winner Picked ")
                })
                try {
                    const recentWinner = await lottery.getRecentWinner()
                    const lotteryState = await lottery.getLotteryState()
                    const endingTimeStamp = await lottery.getLastTimeStamp()
                    await expect(lotteryContract.getPlayer(0)).to.be.reverted
                    assert.equal(recentWinner.toString(), accounts[2].address)
                    assert.equal(lotteryState, 0)
                    assert(endingTimeStamp > StartingTimeStamp)
                    resolved()
                } catch (e) {
                    rejected()
                }

            })
            const tx = await lottery.perfromUpkeep([])
            const txRecepiet = await tx.wait(1)
            await vrfCoordinatorV2Mock.fulfillRandomWords(
                txReceipt.events[1].args.requestId,
                lottery.address
            )
        })
    })
})

