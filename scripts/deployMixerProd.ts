import hre, { ethers } from "hardhat";
import { Mixer__factory } from "../typechain-types/factories/contracts";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//деплой скриптом npx hardhat run --network mainnetBSC  .\scripts\deployMixerProd.ts
async function main() {
  //change:
  const deployerAddress = "0x9efE3B3d2C516970B902364444411103d077160D";

  const TUDAddress = "0xC846B9648a9681A3ECf8213e457E6d8c215c4ea3";
  const TUDSYAdress = "0x518FaD937053db90f4942BbE88d70f1643965E44";
  const operatorAddress = "0x84c78D6F2B92350495586B2d711274D4Ccc75c22";
  const stackingAddress = "0x36d316AbEb1DD9FaB65E0d92cd3c2bdd9b9A0B5c";

  const accounts = await ethers.getSigners();
  const deployer = accounts.find((x) => x.address == deployerAddress);

  console.log("Deploying contracts with the account:", deployer?.address);

  const mixer = await new Mixer__factory(deployer).deploy(
    TUDAddress,
    TUDSYAdress,
    operatorAddress,
    stackingAddress
  );
  await mixer.deployed();

  console.log("Mixer deployed to:", mixer.address);

await(
  await mixer.transferOwnership("0x7Df6c2637FD7481B11E5F6EB14B0EdFB174cCd80")
).wait();

  await sleep(5 * 1000);

  // закомментируйте этот блок если верификация не нужна
  /*--------------------------------------------
  try {
    await hre.run("verify:verify", {
      address: mixer.address,
      contract: "contracts/Mixer.sol:Mixer",
      constructorArguments: [
        TUDAddress,
        TUDSYAdress,
        operatorAddress,
        stackingAddress,
      ],
    });
  } catch (e) {
    //console.log(e);
  }*/
  /*--------------------------------------------*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
