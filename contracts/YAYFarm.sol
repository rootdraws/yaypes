// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract YAYFarm is ReentrancyGuard {
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    IERC20 public immutable yay;         // YAY token
    IERC20 public immutable lpToken;     // LP token
    uint256 public immutable yayPerBlock;  // YAY tokens rewarded per block
    uint256 public lastRewardBlock;      // Last block number rewards were distributed
    uint256 public accYayPerShare;       // Accumulated YAY per share, times 1e12

    mapping(address => UserInfo) public userInfo;

    event Deposit(address indexed user, uint256 amount);
    event Withdraw(address indexed user, uint256 amount);

    constructor(
        IERC20 _yay,
        IERC20 _lpToken,
        uint256 _yayPerBlock
    ) {
        yay = _yay;
        lpToken = _lpToken;
        yayPerBlock = _yayPerBlock;
        lastRewardBlock = block.number;
    }

    function updatePool() public {
        if (block.number <= lastRewardBlock) {
            return;
        }
        uint256 lpSupply = lpToken.balanceOf(address(this));
        if (lpSupply == 0) {
            lastRewardBlock = block.number;
            return;
        }
        uint256 multiplier = block.number - lastRewardBlock;
        uint256 yayReward = multiplier * yayPerBlock;
        accYayPerShare = accYayPerShare + (yayReward * 1e12 / lpSupply);
        lastRewardBlock = block.number;
    }

    function deposit(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        updatePool();
        if (user.amount > 0) {
            uint256 pending = (user.amount * accYayPerShare / 1e12) - user.rewardDebt;
            if (pending > 0) {
                safeYayTransfer(msg.sender, pending);
            }
        }
        if (_amount > 0) {
            lpToken.safeTransferFrom(msg.sender, address(this), _amount);
            user.amount += _amount;
        }
        user.rewardDebt = user.amount * accYayPerShare / 1e12;
        emit Deposit(msg.sender, _amount);
    }

    function withdraw(uint256 _amount) external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        require(user.amount >= _amount, "withdraw: not enough");
        updatePool();
        uint256 pending = (user.amount * accYayPerShare / 1e12) - user.rewardDebt;
        if (pending > 0) {
            safeYayTransfer(msg.sender, pending);
        }
        if (_amount > 0) {
            user.amount -= _amount;
            lpToken.safeTransfer(msg.sender, _amount);
        }
        user.rewardDebt = user.amount * accYayPerShare / 1e12;
        emit Withdraw(msg.sender, _amount);
    }

    function safeYayTransfer(address _to, uint256 _amount) internal {
        uint256 yayBal = yay.balanceOf(address(this));
        if (_amount > yayBal) {
            yay.transfer(_to, yayBal);
        } else {
            yay.transfer(_to, _amount);
        }
    }

    function pendingYay(address _user) external view returns (uint256) {
        UserInfo storage user = userInfo[_user];
        uint256 lpSupply = lpToken.balanceOf(address(this));
        uint256 _accYayPerShare = accYayPerShare;
        
        if (block.number > lastRewardBlock && lpSupply != 0) {
            uint256 multiplier = block.number - lastRewardBlock;
            uint256 yayReward = multiplier * yayPerBlock;
            _accYayPerShare = _accYayPerShare + (yayReward * 1e12 / lpSupply);
        }
        return (user.amount * _accYayPerShare / 1e12) - user.rewardDebt;
    }

    // Emergency function to recover stuck tokens
    function emergencyWithdraw() external nonReentrant {
        UserInfo storage user = userInfo[msg.sender];
        uint256 amount = user.amount;
        user.amount = 0;
        user.rewardDebt = 0;
        lpToken.safeTransfer(msg.sender, amount);
        emit Withdraw(msg.sender, amount);
    }
} 