import hre, { ethers } from "hardhat";
import { BNFT, Operator } from "../typechain-types/contracts";
import deployContract from "./deployContractHelper";

async function main() {
  const deployerAddress = "0x9efE3B3d2C516970B902364444411103d077160D";
  const accounts = await ethers.getSigners();
  const deployer = accounts.find((x) => x.address == deployerAddress);

  console.log("Deploying contracts with the account:", deployer?.address);

  const nft = await deployContract<BNFT>(
    "BNFT",
    deployer!.address,
    deployer!.address,
    "TEST",
    "TEST",
    "TEST"
  );

  await nft.deployed();
  console.log("Token deployed to:", nft.address);
  const operator = await deployContract<Operator>(
    "Operator",
    nft!.address,
    "0x78E4cc313C7ECdD2f86C0A3ac9AbeD26FCcFfF70"
  );

  await operator.deployed();
  console.log("Token deployed to:", operator.address);
  try {
    await hre.run("verify:verify", {
      address: nft.address,
      contract: "contracts/BNFT.sol:BNFT",
      constructorArguments: [
        deployer!.address,
        deployer!.address,
        "TEST",
        "TEST",
        "TEST",
      ],
    });
  } catch (e) {
    console.log(e);
  }
  /*try {
    await hre.run("verify:verify", {
      address: operator.address,
      contract: "contracts/Operator.sol:Operator",
      constructorArguments: [
        nft!.address,
        "0x78E4cc313C7ECdD2f86C0A3ac9AbeD26FCcFfF70",
      ],
    });
  } catch (e) {
    console.log(e);
  }*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
