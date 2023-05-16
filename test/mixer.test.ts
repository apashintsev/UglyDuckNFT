import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import { expect } from "chai";
import { ethers } from "hardhat";
import {
  Operator__factory,
  BNFT__factory,
  Mixer__factory,
} from "../typechain-types/factories/contracts";

describe("Mixer tests", () => {
  const deploy = async () => {
    const [deployer, stacking, user1, user2] = await ethers.getSigners();

    const tud = await new BNFT__factory(deployer).deploy(
      deployer!.address,
      deployer!.address,
      "TEST",
      "TEST",
      "TUD"
    );
    await tud.deployed();

    const tudsy = await new BNFT__factory(deployer).deploy(
      deployer!.address,
      deployer!.address,
      "TEST",
      "TEST",
      "TUDSY"
    );
    await tudsy.deployed();

    const operator = await new Operator__factory(deployer).deploy(
      tud!.address,
      stacking.address
    );
    await operator.deployed();

    const mixer = await new Mixer__factory(deployer).deploy(
      tud.address,
      tudsy.address,
      operator.address,
      stacking.address
    );
    await mixer.deployed();

    return {
      tud,
      tudsy,
      mixer,
      operator,
      deployer,
      stacking,
      user1,
      user2,
    };
  };

  it("All deployed correctly and start settings is right", async () => {
    const {
      deployer,
      tud,
      tudsy,
      stacking,
      operator,
      user1,
      mixer,
    } = await loadFixture(deploy);

    await (await tud.mint(user1.address, 10)).wait();

    const txApproveTud = await tud
      .connect(user1)
      .setApprovalForAll(operator.address, true);
    await txApproveTud.wait();

    await (await operator.connect(user1).stake(10)).wait();

    const newBalance = await tud.balanceOf(user1.address);
    //console.log({ newBalance });
    /*for (let i = 0; i < newBalance.toNumber(); i++) {
      const tokenId = (
        await tud.tokenOfOwnerByIndex(user1.address, i)
      ).toNumber();
      console.log({ tokenId });
    }*/

    const stakedBalance = await operator.stakingBalance(user1.address);
    //console.log({ stakedBalance });

    await (await tudsy.mint(user1.address, 10)).wait();
    const txApproveTudsy = await tudsy
      .connect(user1)
      .setApprovalForAll(mixer.address, true);
    await txApproveTudsy.wait();
    const txApproveTudFm = await tud
      .connect(user1)
      .setApprovalForAll(mixer.address, true);
    await txApproveTudFm.wait();

    await (await mixer.connect(user1).mix(10)).wait();
    console.log("eggs");

    const mixed = await mixer.getMixedTokens(user1.address);
    console.log({ mixed });

    const balanceTudsyAfterMixing  = await tudsy.balanceOf(user1.address)
    console.log({balanceTudsyAfterMixing})
    /*const eggs = await mixer.getEggs(user1.address);
    for (let i = 0; i < eggs.length; i++) {
      const eggType = eggs[i];
      console.log({ eggType });
    } */
    /**/
  });
});
