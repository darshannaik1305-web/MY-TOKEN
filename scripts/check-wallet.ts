import hre from "hardhat";

async function main() {
  const [wallet] = await hre.viem.getWalletClients();
  const publicClient = await hre.viem.getPublicClient();

  console.log("Connected Chain ID:", await publicClient.getChainId());
  console.log("Wallet Address:", wallet.account.address);

  const balance = await publicClient.getBalance({
    address: wallet.account.address,
  });

  console.log("Wallet Balance:", balance.toString(), "wei");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});