import hre, { ethers } from "hardhat";
import { BNFT, Operator } from "../typechain-types/contracts";
import deployContract from "./deployContractHelper";
import {
  BNFT__factory,
  Mixer__factory,
  Operator__factory,
} from "../typechain-types/factories/contracts";

async function main() {
  const deployerAddress = "0x9efE3B3d2C516970B902364444411103d077160D";
  const stackingAddress = "0x78E4cc313C7ECdD2f86C0A3ac9AbeD26FCcFfF70";
  const accounts = await ethers.getSigners();
  const deployer = accounts.find((x) => x.address == deployerAddress);

  console.log("Deploying contracts with the account:", deployer?.address);

  const tud = await new BNFT__factory(deployer).deploy(
    deployer!.address,
    deployer!.address,
    "TEST",
    "TEST",
    "TUD"
  );
  await tud.deployed();
  console.log("Token TUD deployed to:", tud.address);

  const tudsy = await new BNFT__factory(deployer).deploy(
    deployer!.address,
    deployer!.address,
    "TEST",
    "TEST",
    "TUDSY"
  );
  await tudsy.deployed();
  console.log("Token TUDSY deployed to:", tudsy.address);

  const operator = await new Operator__factory(deployer).deploy(
    tud!.address,
    stackingAddress
  );
  await operator.deployed();
  console.log("Operator deployed to:", operator.address);

  const mixer = await new Mixer__factory(deployer).deploy(
    tud.address,
    tudsy.address,
    operator.address,
    stackingAddress
  );
  await mixer.deployed();
  console.log("Mixer deployed to:", operator.address);

  try {
    await hre.run("verify:verify", {
      address: tud.address,
      contract: "contracts/BNFT.sol:BNFT",
      constructorArguments: [
        deployer!.address,
        deployer!.address,
        "TEST",
        "TEST",
        "TUD",
      ],
    });
  } catch (e) {
    console.log(e);
  }

  try {
    await hre.run("verify:verify", {
      address: tudsy.address,
      contract: "contracts/BNFT.sol:BNFT",
      constructorArguments: [
        deployer!.address,
        deployer!.address,
        "TEST",
        "TEST",
        "TUDSY",
      ],
    });
  } catch (e) {
    console.log(e);
  }
  try {
    await hre.run("verify:verify", {
      address: operator.address,
      contract: "contracts/Operator.sol:Operator",
      constructorArguments: [
        tud!.address,
        "0x78E4cc313C7ECdD2f86C0A3ac9AbeD26FCcFfF70",
      ],
    });
  } catch (e) {
    console.log(e);
  }
  try {
    await hre.run("verify:verify", {
      address: mixer.address,
      contract: "contracts/Mixer.sol:Mixer",
      constructorArguments: [
        tud.address,
        tudsy.address,
        operator.address,
        stackingAddress,
      ],
    });
  } catch (e) {
    console.log(e);
  } /**/

  console.log("Mixer deployed to:", mixer.address);
  console.log("Operator deployed to:", operator.address);
  console.log("Token TUD deployed to:", tud.address);
  console.log("Token TUDSY deployed to:", tudsy.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
