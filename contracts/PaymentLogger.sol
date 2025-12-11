// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/// @title PaymentLogger - Minimal contract to log payment-like events for analytics
contract PaymentLogger {
    /// @notice Emitted whenever a "payment" is logged.
    /// @param from The address sending funds
    /// @param to The address receiving funds
    /// @param amount The amount (in smallest units, e.g. 6 or 18 decimals depending on token)
    /// @param timestamp Block timestamp when the payment was logged
    event PaymentLogged(address indexed from, address indexed to, uint256 amount, uint256 timestamp);

    /// @notice Log a payment event. In a real system this might be called by a payment router.
    /// @param to The address receiving funds
    /// @param amount The amount (in token smallest units)
    function logPayment(address to, uint256 amount) external {
        emit PaymentLogged(msg.sender, to, amount, block.timestamp);
    }
}
