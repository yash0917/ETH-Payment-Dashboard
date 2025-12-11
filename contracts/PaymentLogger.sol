// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PaymentLogger {
    event PaymentLogged(address indexed from, address indexed to, uint256 amount, uint256 timestamp);

    function logPayment(address to, uint256 amount) external {
        emit PaymentLogged(msg.sender, to, amount, block.timestamp);
    }
}
