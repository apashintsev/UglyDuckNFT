import hre, { ethers } from "hardhat";
import { Mixer__factory } from "../typechain-types/factories/contracts";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

//деплой скриптом npx hardhat run --network mumbai  .\scripts\deployMixer.ts
async function main() {
  //change:
  const deployerAddress = "0x9efE3B3d2C516970B902364444411103d077160D";

  const TUDAddress = "0x59fC9F7a213b5bBAc1Ff4F1E84858D75754D0D5e";
  const TUDSYAdress = "0x5dcB916795365865BE7352F21a1efF27df9e397f";
  const operatorAddress = "0x5CFA4aA2cb191d8536e8Fc993341F097304f7B18";
  const stackingAddress = "0x78e4cc313c7ecdd2f86c0a3ac9abed26fccfff70";

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

  await sleep(5 * 1000);

  // закомментируйте этот блок если верификация не нужна
  /*--------------------------------------------*/
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
  }
  /*--------------------------------------------*/
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
