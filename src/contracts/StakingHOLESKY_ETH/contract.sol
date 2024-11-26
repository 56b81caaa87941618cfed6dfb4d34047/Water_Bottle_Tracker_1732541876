
// SPDX-License-Identifier: MIT
pragma solidity 0.8.20;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract StakingHOLESKY_ETH is ReentrancyGuard, Ownable {
    mapping(address => uint256) private _stakedBalances;
    uint256 public totalStaked;

    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);

    constructor() Ownable() {}

    function stake() external payable nonReentrant {
        require(msg.value > 0, "Cannot stake 0 ETH");

        _stakedBalances[msg.sender] += msg.value;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }

    function withdraw(uint256 amount) external nonReentrant {
        require(amount > 0, "Cannot withdraw 0 ETH");
        require(_stakedBalances[msg.sender] >= amount, "Insufficient staked balance");

        _stakedBalances[msg.sender] -= amount;
        totalStaked -= amount;

        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");

        emit Withdrawn(msg.sender, amount);
    }

    function getStakedBalance(address account) external view returns (uint256) {
        return _stakedBalances[account];
    }

    receive() external payable {
        require(msg.value > 0, "Cannot stake 0 ETH");

        _stakedBalances[msg.sender] += msg.value;
        totalStaked += msg.value;

        emit Staked(msg.sender, msg.value);
    }
}
