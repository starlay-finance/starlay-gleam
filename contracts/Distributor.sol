//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Distributor is Ownable {
    IERC20 internal immutable rewardToken;

    mapping(uint256 => Ditrtibutee) public distributionAmount;

    uint256 public distributeeIdx;
    uint256 public distributedIdx;

    struct Ditrtibutee {
        address account;
        uint256 amount;
    }

    event Distributed(uint256 distributedIdx);
    event Refunded(address to, uint256 amount);
    event DistributionAmountAdded(uint256 distributeeIdx);

    constructor(address _rewardToken) {
        rewardToken = IERC20(_rewardToken);
    }

    function distribute() external {
        for (uint256 i = distributedIdx + 1; i <= distributeeIdx; i++) {
            _distribute(
                distributionAmount[i].account,
                distributionAmount[i].amount
            );
            distributedIdx++;
        }
        emit Distributed(distributedIdx);
    }

    function totalDistributionAmount()
        public
        view
        returns (uint256 totalAmount)
    {
        for (uint256 i = 0; i <= distributeeIdx; i++) {
            totalAmount += distributionAmount[i].amount;
        }
    }

    function refund(uint256 amount) public onlyOwner {
        rewardToken.transfer(owner(), amount);
    }

    function distributeTo(uint256 size) external {
        uint256 from = distributedIdx + 1;
        uint256 to = min(distributeeIdx, distributedIdx + size);
        for (uint256 i = from; i <= to; i++) {
            _distribute(
                distributionAmount[i].account,
                distributionAmount[i].amount
            );
            distributedIdx++;
        }
        emit Distributed(distributedIdx);
    }

    function min(uint256 one, uint256 another) internal pure returns (uint256) {
        if (one < another) {
            return one;
        }
        return another;
    }

    function addDistributions(
        address[] calldata addresses,
        uint256[] calldata amounts
    ) external onlyOwner {
        require(addresses.length == amounts.length, "size mismatch");
        for (uint256 i = 0; i < addresses.length; i++) {
            distributeeIdx++;
            distributionAmount[distributeeIdx] = Ditrtibutee(
                addresses[i],
                amounts[i]
            );
        }
        emit DistributionAmountAdded(distributeeIdx);
    }

    function _distribute(address to, uint256 amount) internal {
        rewardToken.transfer(to, amount);
    }
}
