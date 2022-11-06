// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Recorder {
    transaction[] private transactions;
    uint constant private fee=10000000000000000000;
	struct transaction{
        string date;
        address key;
        uint id;
        string hash;
    }

    event success(bool flag);

	function RecordTransaction(address TokenAddress, string memory date, string memory hash, uint id, address key) public payable  {
        uint balance = IERC20(TokenAddress).balanceOf(msg.sender);
        require(balance>=10,"Insufficient balance! your wallet should have a minimum balance eof 10 TRX to execute this transaction");
        bool TrxPaid =  IERC20(TokenAddress).transferFrom(msg.sender,address(this),fee); 
        require(TrxPaid==true,"Trax fee payment failed! please check if your have a minimum balance of 10TRX in your wallet");
        transactions.push(transaction(date,key,id,hash));
        emit success(true);
	}

    function TransactionsByUser(address add) public view returns(uint) {
        uint count=0;
        for(uint i=0; i<transactions.length;i++){
            if (keccak256(abi.encode(transactions[i].key))==keccak256(abi.encode(add))) {
                count++;
            }
        }
        return count;
    }

    function TransactionsByDate(string memory date) public view returns(uint) {
        uint count=0;
        for(uint i=0; i<transactions.length;i++){
            if (keccak256(abi.encode(transactions[i].date))==keccak256(abi.encode(date))) {
                count++;
            }
        }
        return count;
    }

    function GetTransaction(address add, string memory date, uint id) public view returns(string memory) {
        for(uint i=0; i<transactions.length;i++){
            if (keccak256(abi.encode(transactions[i].id))==keccak256(abi.encode(id))&&keccak256(abi.encode(transactions[i].key))==keccak256(abi.encode(add))&&keccak256(abi.encode(transactions[i].date))==keccak256(abi.encode(date))) {
                return transactions[i].hash;
            }
        }
        return "no transaction found!";
    }
}