import {  useMoralis } from "react-moralis";
import { useWeb3Contract } from "react-moralis";
import {abi} from "../constants/abi.json"
import {contract_address} from "../constants/contract_address.json"
import { useState, useEffect } from "react";
import { ethers} from "hardhat";

export default function ConnectButton()
{
    let [entraceFee, setEntranceFee] = useState("0");
    const {chainId:hexChainId, isWeb3Enabled} = useMoralis()
    const _chainId = parseInt(hexChainId)
    console.log(_chainId)
    //  const lotteryAddress = _chainId in contract_address ? contract_address[_chainId][0] : null 
    const {runContractFunction: getEntranceFee}= useWeb3Contract(
        {
        //  address: lotteryAddress,
        functionName: "getEntranceFee",
        abi: abi,
        params: {},
        }
    )
        entraceFee = getEntranceFee
        console.log(entraceFee)

    const { runContractFunction : enterLottery
      } = useWeb3Contract({
        // address: lotteryAddress,
        functionName: "enterLottery",
        abi: abi,
        //  msgValue: entranceFee,
        params: {},
      });

      useEffect(() => {
        if(isWeb3Enabled)
        {
            async function UpdateUI()
            {
                const entranceFeeFromContract=  await getEntranceFee().toString()
                setEntranceFee(ethers.utils.formatUnits(entranceFeeFromContract), "ethers")
                
            }
            UpdateUI()
        }
      }, [isWeb3Enabled]);
    return(
        <>
            <div>Hi my name </div>
        <div>entraceFee</div>
        </>
    
    )
}