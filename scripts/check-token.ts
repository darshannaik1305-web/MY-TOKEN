import hre from "hardhat";
import { getAddress, formatUnits } from "viem";

async function main() {
  const tokenAddress = getAddress(
    "0x46d877f12066f38bb0a5fb9556ed6e9d1f83f671"
  );

  const token = await hre.viem.getContractAt(
    "MyToken",
    tokenAddress
  );

  const name = await token.read.name();
  const symbol = await token.read.symbol();
  const decimals = await token.read.decimals();
  const totalSupply = await token.read.totalSupply();

  const treasury = getAddress(
    "0x6338beaf201ec3750f2350572f3579c500c7379f"
  );

  const balance = await token.read.balanceOf([treasury]);

  console.log("Token Name:", name);
  console.log("Token Symbol:", symbol);
  console.log("Decimals:", decimals);
  console.log("Total Supply:", formatUnits(totalSupply, decimals));
  console.log("Treasury Balance:", formatUnits(balance, decimals));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});