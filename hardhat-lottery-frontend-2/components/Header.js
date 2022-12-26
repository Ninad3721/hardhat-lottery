import { useMoralis } from "react-moralis";
import { useEffect } from "react";
import { ConnectButton } from "web3uikit"

export default function Header()
{
    return(
        <ConnectButton moralisAuth={false}/>
        
    )

 
}