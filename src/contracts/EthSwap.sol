// SPDX-License-Identifier: MIT

pragma solidity >=0.5.0;

import "./Token.sol";

//EthSwap smart contract
// truffle compile to make sure contract has no syntax errors
contract EthSwap {
    string public name = "EthSwap Instant Exchange";
    Token public token;
    uint public rate = 100;

    event TokensPurchased(
        address account,
        address token,
        uint amount,
        uint rate
    );

    event TokensSold(
        address account,
        address token,
        uint amount,
        uint rate
    );

    constructor(Token _token) public {
        token = _token;
    }

    //who is buying and how much tokens.
    //msg.sender is a global var that determines which address is purchasing the tokens
    //msg.value is similar to sender, just for the value of ETH user has provided
    // payable allows us to send Eth whenever we call this function.
    function buyTokens() public payable {
        //eth* number of tokens they receive for 1 ether, which is 100 in this case
        uint tokenAmount = msg.value * rate;

        //Make sure that balance is greater then or equal to token purchased
        require(token.balanceOf(address(this)) >= tokenAmount);

        //transfer tokens to the user.
        token.transfer(msg.sender, tokenAmount);

        emit TokensPurchased(msg.sender, address(token), tokenAmount, rate);
    }
    //1:27:20 end of buy tokens and start of the sell tokens (below) 

    function sellTokens(uint _amount) public payable{
    // User can't sell more than they have
    require(token.balanceOf(msg.sender) >= _amount);

     //Calculate the amount of Ether to redeem
     uint etherAmount = _amount / rate;

    require(address(this).balance >= etherAmount);

     //Perform sale
     token.transferFrom(msg.sender, address(this), _amount);
     //payable(msg.sender).transfer(etherAmount);
     msg.sender.transfer(etherAmount);

     emit TokensSold(msg.sender, address(token), _amount, rate);
    }

}

