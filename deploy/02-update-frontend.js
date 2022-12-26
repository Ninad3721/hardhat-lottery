const {ethers, network} = require("hardhat")
const { ForStatement } = require("prettier-plugin-solidity/src/nodes")
const fs = require("fs")
require("dotenv").config
const update_frontend = true
const contract_address_json =  "./hardhat-lottery-frontend/constants/contract_address.json"
const abi_json =  "./hardhat-lottery-frontend/constants/abi.json"
module.exports = async function () 
{
   if(update_frontend)
   
   {
    console.log("Frontend Update  intiated")
    updateContractAbi()
    updateContractAddress()
    console.log("Updated")
   }
}

async function updateContractAbi()
{
    const lottery = await ethers.getContract("Lottery")
    fs.writeFileSync(abi_json, lottery.interface.format(ethers.utils.FormatTypes.json))
}
async function updateContractAddress ()
{
    const lottery = await ethers.getContract("Lottery")
    const chainId = network.config.chainId.toString()
    const current_address = JSON.parse(fs.readFileSync(contract_address_json,"utf8"))//Converts json string to JS Object
    if(chainId in current_address)
    {
        console.log("")
        if(!current_address[chainId].includes(lottery.address))
        {
            current_address[chainId].push(lottery.address)
        }
    }
    {
        current_address[chainId] = [lottery.address]
    }
          
        
        fs.writeFileSync(contract_address_json, JSON.stringify(current_address))
    }

    
    

module.exports.tags = ["all", "frontend"]