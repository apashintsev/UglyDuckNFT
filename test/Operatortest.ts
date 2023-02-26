import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import deployContract from "../scripts/deployContractHelper";
import { BNFT, Operator } from "../typechain-types/contracts";

describe("Operator tests", () => {
  const deploy = async () => {
    const [deployer, stacking, user1, user2] = await ethers.getSigners();

    const nft = await deployContract<BNFT>(
      "BNFT",
      deployer!.address,
      deployer!.address,
      "TEST",
      "TEST",
      "TEST"
    );

    await nft.deployed();

    const operator = await deployContract<Operator>(
      "Operator",
      nft!.address,
      stacking.address
    );

    await nft.deployed();

    return {
      nft,
      operator,
      deployer,
      stacking,
      user1,
      user2,
    };
  };

  it("All deployed correctly and start settings is right", async () => {
    const { deployer, nft, stacking, operator, user1 } = await loadFixture(
      deploy
    );

    const txMint = await nft.mint(user1.address, 20);
    await txMint.wait();

    expect(await nft.balanceOf(user1.address)).equals(20);

    const txApprove = await nft
      .connect(user1)
      .setApprovalForAll(operator.address, true);
    await txApprove.wait();

    const txStake = await operator.connect(user1).stake(11);
    await txStake.wait();

    const newBalance = await nft.balanceOf(user1.address);
    console.log({ newBalance });
    for (let i = 0; i < newBalance.toNumber(); i++) {
      const tokenId = (
        await nft.tokenOfOwnerByIndex(user1.address, i)
      ).toNumber();
      console.log({ tokenId });
    }

    const stakedBalance = await operator.stakingBalance(user1.address);
    console.log({ stakedBalance });
  });
});
