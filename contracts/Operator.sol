// SPDX-License-Identifier: MIT
pragma solidity 0.8.9;

import "./BNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

///@title Operator
///@notice Contract for transfer NFTs from user to staking address
contract Operator is Ownable {
    struct StakeItem {
        uint256 nftId;
        uint256 stakedAt;
    }

    ///@notice Addres for staking
    address public staking;
    ///@notice Address of staked NFT contract
    BNFT public nft;

    mapping(uint256 => mapping(address => StakeItem[])) private staked;
    mapping(uint256 => address[]) private stakers;

    ///@notice Current staking phase
    uint8 public stakingPhase;
    ///@notice When it is true users cant add NFTs at current phase
    bool public addStopped;

    constructor(address nft_, address staking_) {
        nft = BNFT(nft_);
        staking = staking_;
    }

    ///@notice This function is calling  when user wants to stake their NFTs. It takes NFTs randomly.
    ///@param count NFT for stake count
    function stake(uint256 count) external {
        if (addStopped) {
            revert("Adding new items stopped");
        }
        if (staked[stakingPhase][msg.sender].length == 0) {
            stakers[stakingPhase].push(msg.sender);
        }
        for (uint32 i = 0; i < count; ) {
            uint256 idx = uint256(
                keccak256(abi.encodePacked(block.timestamp))
            ) % nft.balanceOf(msg.sender);
            uint256 tokenId = nft.tokenOfOwnerByIndex(msg.sender, idx);
            nft.transferFrom(msg.sender, staking, tokenId);
            staked[stakingPhase][msg.sender].push(
                StakeItem(tokenId, block.timestamp)
            );
            unchecked {
                ++i;
            }
        }
    }

    ///@notice Call this when you want to increase stake phase (only owner)
    function increaseStakePhase() external onlyOwner {
        stakingPhase += 1;
    }

    ///@notice Call this when you want to stop receiving NFTs at current stake phase (only owner)
    function setAddStopped(bool value) external onlyOwner {
        addStopped = value;
    }

    ///@notice user`s balance of staked tokens
    ///@param user address of user
    ///@return NFTs at stake count
    function stakingBalance(address user) public view returns (uint256) {
        return staked[stakingPhase][user].length;
    }

    ///@notice user`s staked tokens
    ///@param user address of user
    ///@return user`s staked token ids with start staking date
    function getStakedTokens(address user)
        external
        view
        returns (StakeItem[] memory)
    {
        return staked[stakingPhase][user];
    }

    ///@notice Get all stakers
    ///@return all stakers addresses
    function getStakers() external view returns (address[] memory) {
        return stakers[stakingPhase];
    }
}
