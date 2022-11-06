// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Trax is ERC20, Ownable{
    constructor() ERC20("Trax","TRX"){
        _mint(msg.sender,200000*10**18);
    }

    function mint(address to,uint256 amount)public onlyOwner {
        _mint(to,amount);
    }

    function burn(address account,uint ammount)public onlyOwner {
        _burn(account,ammount);
    }

    function GetAllowance(address owner, address spender) public view returns(uint){
        return allowance(owner, spender)/(10**18);
    }

    function GetBalance(address add) public view returns(uint) {
        return balanceOf(add)/(10**18);
    }
}