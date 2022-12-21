//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol"; 
import "@chainlink/contracts/src/v0.8/interfaces/AutomationCompatibleInterface.sol";

    error notEnoughFee(); //Error are like custom error handlers in java
    error TransactionFailed();
    error lotteryStateNotOpen();
    error Lottery_UpkeepNotNeeded(uint256 currentBalance, uint256 numPlayers, uint256 LotteryState);
contract Lottery is VRFConsumerBaseV2, AutomationCompatibleInterface {
    enum lotteryState{
        OPEN,
        CALCULATING
    }
    
    uint256 private immutable i_entranceFee; //Making varibales immutable reduced gas fee
    address payable[] private s_players; // Array of payable address as one of the address will win and we will have to pay him/her.
    uint64 private immutable i_subscriptionId;
    bytes32 private immutable i_gasLane;
    uint32 private immutable i_callbackGasLimit;
    uint16 private constant REQUEST_CONFIRMATIONS = 3;
    uint32 private constant NUM_WORDS = 1;
    uint256 private immutable i_interval;

    //lOTTERY VARIABLES
    address private s_recentWinner;
    lotteryState private s_lotteryState;
    uint256 private s_lastTimeStamp;

    VRFCoordinatorV2Interface private immutable i_VRFCoordinator;



    event EnterLottery(address indexed player);
    event winnerPicked(address indexed player);

    constructor(
        address VRFCoordinatorV2,
        uint256 _entranceFee,
        bytes32 gasLane,
        uint32 callbackGasLimit,
        uint64 subscriptionId,
        uint256 interval) VRFConsumerBaseV2(VRFCoordinatorV2) {
        i_VRFCoordinator = VRFCoordinatorV2Interface(VRFCoordinatorV2);
        i_entranceFee = _entranceFee;
        i_gasLane = gasLane;
        i_subscriptionId = subscriptionId;
        i_callbackGasLimit = callbackGasLimit;
        s_lotteryState = lotteryState.OPEN;
        i_interval = interval ;
        s_lastTimeStamp = block.timestamp;

    }

    function enterLottery() public payable //
    {
        s_lotteryState = lotteryState.OPEN;
        if (msg.value < i_entranceFee) {
            revert notEnoughFee();
        }
        if(s_lotteryState != lotteryState.OPEN)
        {
            revert lotteryStateNotOpen();   
        }
        s_players.push(payable(msg.sender));
        emit EnterLottery(msg.sender); //We are storing address of player in logs
    }

    function performUpkeep(bytes calldata /*performData*/) external override  {
        (bool UpkeepNeeded, )= checkUpkeep("");
         if (!UpkeepNeeded) {
            revert Lottery_UpkeepNotNeeded(
                address(this).balance,
                s_players.length,
                uint256(s_lotteryState)
            );}
         s_lotteryState = lotteryState(1);
        uint256 requestId = i_VRFCoordinator.requestRandomWords(
            i_gasLane,
            i_subscriptionId,
            REQUEST_CONFIRMATIONS,
            i_callbackGasLimit,
            NUM_WORDS
        );
    }
    /** 
     *@dev This is checkUpkeep function and this is used to keep a watch on the blockchain to triger a particular action after
     a particular condition is fulfilled here all the given condition must be fulfilled so that it returns a bool which will tell the 
     performUpkeeep function to triger
    */
   
    function checkUpkeep ( bytes memory /*heckData*/ ) public view override returns (bool upkeepNeeded, bytes memory /*performData*/) {
        bool isOpen = lotteryState.OPEN == s_lotteryState;
        bool timePassed = ((block.timestamp - s_lastTimeStamp) > i_interval);
        bool hasPlayers = s_players.length > 0;
        bool hasBalance = address(this).balance > 0;
        upkeepNeeded = (timePassed && isOpen && hasBalance && hasPlayers);
    }

    function fulfillRandomWords(uint256, uint256[] memory randomWords) internal override {
         s_lotteryState = lotteryState(1);
        uint256 indexOfWinner = randomWords[0] % s_players.length;
        address payable recentWinner = s_players[indexOfWinner];
        s_recentWinner = recentWinner;
        s_players = new address payable[](0);
        s_lotteryState = lotteryState.OPEN;
        s_lastTimeStamp = block.timestamp;
        (bool success, ) = recentWinner.call{value: address(this).balance}("");
        if (!success) {
            revert TransactionFailed();
        }
        emit winnerPicked(recentWinner);
    }

    function getWinner() private view returns (address) {
        return s_recentWinner;
    }

      function getLotteryState() public view returns (lotteryState) {
        return s_lotteryState;
    }
    function getNumWords() public pure returns (uint256)
    {
        return NUM_WORDS;
    }
    function getRecentWinner() public view returns (address) {
        return s_recentWinner;
    }
    function getPlayer(uint256 index) public view returns (address) {
        return s_players[index];
    }
    
     function getInterval() public view returns (uint256) {
        return i_interval;
    }

    function getEntranceFee() public view returns (uint256) {
        return i_entranceFee;
    }
     function getNumberOfPlayers() public view returns (uint256) {
        return s_players.length;
    }
    function getRequestConfirmations() public pure returns (uint256) {
        return REQUEST_CONFIRMATIONS;
    }
    function getLastTimeStamp() public view returns (uint256) {
        return s_lastTimeStamp;
    }
  
}

    