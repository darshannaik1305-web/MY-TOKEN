
import hre from "hardhat";
import { getAddress } from "viem";

async function main() {
  const [deployer] = await hre.viem.getWalletClients();

  const treasuryAddress = process.env.TREASURY;

  if (!treasuryAddress) {
    throw new Error("TREASURY address is missing in .env");
  }

  const treasury = getAddress(treasuryAddress);

  console.log("Network: Sepolia");
  console.log("Deployer:", deployer.account.address);
  console.log("Treasury:", treasury);

  console.log("Deploying MyToken...");

  const token = await hre.viem.deployContract("MyToken", [treasury]);

  console.log("Token deployed successfully!");
  console.log("Token contract address:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
