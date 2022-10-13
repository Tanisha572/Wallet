//SPDX-License-Identifier: MIT
pragma solidity >=0.4.16 <0.9.0;

import "@openzeppelin/contracts/utils/Strings.sol";

contract wallet{
    address  public owner;
    Transaction[] history;

    struct Transaction{
        address sender;
        address receiver;
        uint amount; 
        uint timestamp;
        string message;
    }

    constructor() payable{
        owner = msg.sender;
        logTransaction(msg.sender, address(this), msg.value, block.timestamp);
    }

    modifier onlyOwner(){
        require(msg.sender == owner, "error: only the owner is allowed to call this function");
        _;
    }

    receive() external payable{
        //contract receives funds from any other address(including owner) == DEPOSIT
        require(msg.value <= msg.sender.balance, "error: insufficient funds in account");
        logTransaction(msg.sender, address(this), msg.value, block.timestamp);
    }
    
    function logTransaction(address sender, address receiver, uint amt, uint time) private{

        //adding to logs
        string memory sender_addr = Strings.toHexString(uint256(uint160(sender)));
        string memory receiver_addr = Strings.toHexString(uint256(uint160(receiver)));
        string memory message = string(abi.encodePacked(sender_addr," sent an amount of ", 
                                Strings.toString(amt)," to ", receiver_addr," at ", Strings.toString(time*1000), " seconds"));
        Transaction memory tr = Transaction(sender, receiver, amt, time, message);
        history.push(tr);
    }
    function getHistory(uint i) public view returns (string memory){
        return history[i].message;
    }

    function noOfTransactions() public view returns (uint256){
        return history.length;
    }

    function transferAmount(address receiver, uint amt) public payable onlyOwner{   //== TRANSFER 
        require(receiver != msg.sender, "error: an address can't send value to itself");
        require(amt <= address(this).balance, "error: insufficient funds in account");

        payable(receiver).transfer(amt);

        logTransaction(address(this), receiver, amt, block.timestamp);
    } 

    function widthdrawAmount(uint amt) public onlyOwner{    // == WIDTHDRAW
        require(amt <= address(this).balance, "error: insufficient funds in account");

        payable(msg.sender).transfer(amt);
        logTransaction(address(this), msg.sender, amt, block.timestamp);
    }

    function checkBalance() public view onlyOwner returns(uint){
        return address(this).balance;
    }



}