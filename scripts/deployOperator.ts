import hre, { ethers } from "hardhat";
import { BNFT, Operator } from "../typechain-types/contracts";
import deployContract from "./deployContractHelper";

async function main() {
  //change:
  const deployerAddress = "0x9efE3B3d2C516970B902364444411103d077160D";
  const nftAddress = "0x9efE3B3d2C516970B902364444411103d077160D";
  const stakeAddress = "0x9efE3B3d2C516970B902364444411103d077160D";

  console.log({ deployerAddress });
  const accounts = await ethers.getSigners();
  const deployer = accounts.find((x) => x.address == deployerAddress);

  console.log("Deploying contracts with the account:", deployer?.address);

  const operator = await deployContract<Operator>(
    "Operator",
    nftAddress,
    stakeAddress
  );

  await operator.deployed();
  console.log("Operator deployed to:", operator.address);

  try {
    await hre.run("verify:verify", {
      address: operator.address,
      contract: "contracts/Operator.sol:Operator",
      constructorArguments: [nftAddress, stakeAddress],
    });
  } catch (e) {
    console.log(e);
  }
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
