// SPDX-License-Identifier: MIT
pragma solidity 0.8.19;

import "./BNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {Operator} from "./Operator.sol";

///@title Mixer
///@notice Contract for transfer NFTs from user to staking address
contract Mixer is Ownable {
    enum EggType {
        CLASSIC,
        SPECIAL,
        PLATINUM
    }

    ///@notice Addres for staking
    address public immutable staking;
    ///@notice Address of staked TUD NFT contract
    BNFT public immutable tud;
    ///@notice Address of staked TUDSY NFT contract
    BNFT public immutable tudsy;
    ///@notice Address of contract that made TUD staking
    Operator immutable operator;

    address[] private mixers;

    struct MixItem {
        uint256 tudId;
        uint256 tudsyId;
        EggType egg;
    }
    mapping(address => MixItem[]) private mixed;
    mapping(address => uint256) private mixedFromStakingCount;

    constructor(
        address tud_,
        address tudsy_,
        address operator_,
        address staking_
    ) {
        tud = BNFT(tud_);
        tudsy = BNFT(tudsy_);
        operator = Operator(operator_);
        staking = staking_;
    }

    event Mixed(
        address indexed user,
        uint256 tudId,
        uint256 tudsyId,
        EggType egg
    );

    ///@notice This function is calling  when user wants mix their TUD and TUDSY NFTs
    ///@param count NFT for stake count, both TUD and TUDSY
    function mix(uint256 count) external {
        uint256 tudStakedCount = operator.stakingBalance(msg.sender);

        if (mixedFromStakingCount[msg.sender] > 0) {
            tudStakedCount = tudStakedCount > mixedFromStakingCount[msg.sender]
                ? tudStakedCount - mixedFromStakingCount[msg.sender]
                : 0;
        }

        uint256 tudOnWallet = tud.balanceOf(msg.sender);
        if (count > tudStakedCount + tudOnWallet) {
            revert("Not enought TUD");
        }
        if (count > tudsy.balanceOf(msg.sender)) {
            revert("Not enought TUDSY");
        }
        uint256 addFromWalletCount = count > tudStakedCount
            ? count - tudStakedCount
            : 0;
        Operator.StakeItem[] memory tuds = operator.getStakedTokens(msg.sender);
        uint256 addFromStakingCount = tuds.length - mixedFromStakingCount[msg.sender] >= count
            ? count
            : tuds.length - mixedFromStakingCount[msg.sender];
        _mix(
            tuds,
            mixedFromStakingCount[msg.sender]>0?mixedFromStakingCount[msg.sender]-1:0,
            addFromWalletCount,
            addFromStakingCount
        );
    }

    ///@notice This function is calling  when user wants mix their TUD and TUDSY NFTs
    ///@param tuds TUDS that user has in staking
    ///@param tudStartIndex start index of unmixed TUD from staking
    ///@param tudFromWallet number of TUD that will be get from users wallet
    ///@param tudFromStaking number of TUD that will be get from users staking
    function _mix(
        Operator.StakeItem[] memory tuds,
        uint256 tudStartIndex,
        uint256 tudFromWallet,
        uint256 tudFromStaking
    ) private {
        if (mixed[msg.sender].length == 0) {
            mixers.push(msg.sender);
        }
        mixedFromStakingCount[msg.sender] += tudFromStaking;
        for (uint16 i = 0; i < tudFromStaking; ) {
            uint256 idx = uint256(
                keccak256(abi.encodePacked(block.timestamp))
            ) % tudsy.balanceOf(msg.sender);
            uint256 tudsyId = tudsy.tokenOfOwnerByIndex(msg.sender, idx);
            tudsy.transferFrom(msg.sender, staking, tudsyId);
            EggType egg = getEgg(i + tudsyId + tuds[tudStartIndex + i].nftId);
            mixed[msg.sender].push(
                MixItem(tudsyId, tuds[tudStartIndex + i].nftId, egg)
            );

            emit Mixed(msg.sender, tuds[tudStartIndex + i].nftId, tudsyId, egg);
            unchecked {
                ++i;
            }
        }
        for (uint16 i = 0; i < tudFromWallet; ) {
            uint256 idx = uint256(keccak256(abi.encodePacked(block.timestamp)));
            uint256 idxTudsy = idx % tudsy.balanceOf(msg.sender);
            uint256 tudsyId = tudsy.tokenOfOwnerByIndex(msg.sender, idxTudsy);
            tudsy.transferFrom(msg.sender, staking, tudsyId);
            uint256 tudId = tud.tokenOfOwnerByIndex(msg.sender, 0);
            tud.transferFrom(msg.sender, staking, tudId);
            EggType egg = getEgg(i + tudsyId + tudId);
            mixed[msg.sender].push(MixItem(tudsyId, tudId, egg));
            emit Mixed(msg.sender, tudId, tudsyId, egg);
            unchecked {
                ++i;
            }
        }
    }

    ///@notice generates egg pseudorandomly
    ///@return egg
    ///@dev probabilities CLASSIC: 0.6; SPECIAL: 0.3; PLATINUM 0.1;
    function getEgg(uint256 seed) private view returns (EggType) {
        uint256 number = uint256(
            keccak256(abi.encodePacked(seed, block.timestamp))
        ) % 10;
        if (number >= 0 && number <= 5) {
            return EggType.CLASSIC;
        }
        if (number >= 6 && number <= 8) {
            return EggType.SPECIAL;
        }
        return EggType.PLATINUM;
    }

    ///@notice user`s balance of mixed tokens both from staking and wallet
    ///@param user address of user
    ///@return NFTs at stake count
    function mixedBalance(address user) public view returns (uint256) {
        return mixed[user].length;
    }

    ///@notice user`s balance of staked tokens
    ///@param user address of user
    ///@return NFTs at stake count
    function mixedBalanceFromStaking(
        address user
    ) public view returns (uint256) {
        return mixedFromStakingCount[user];
    }

    ///@notice user`s mixed tokens
    ///@param user address of user
    ///@return user`s staked token ids with start staking date
    function getMixedTokens(
        address user
    ) external view returns (MixItem[] memory) {
        return mixed[user];
    }

    ///@notice Get all users who mixed nfts
    ///@return all users addresses
    function getMixers() external view returns (address[] memory) {
        return mixers;
    }
}
