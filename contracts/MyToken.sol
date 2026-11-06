
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title MyToken
/// @notice Fixed-supply ERC-20 token.
contract MyToken is ERC20, ERC20Burnable, ERC20Permit {

    uint256 public constant TOTAL_SUPPLY = 1_000_000_000 * 1e18;

    constructor(address treasury)
        ERC20("My Token", "MTK")
        ERC20Permit("My Token")
    {
        require(treasury != address(0), "Zero address");
        _mint(treasury, TOTAL_SUPPLY);
    }
}
