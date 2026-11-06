
import { loadFixture } from "@nomicfoundation/hardhat-toolbox-viem/network-helpers";
import { expect } from "chai";
import hre from "hardhat";
import { getAddress, parseUnits, parseSignature } from "viem";

describe("MyToken", function () {
  const TOTAL_SUPPLY = parseUnits("1000000000", 18);

  async function deployTokenFixture() {
    const [owner, user] = await hre.viem.getWalletClients();

    const token = await hre.viem.deployContract("MyToken", [
      owner.account.address,
    ]);

    return { token, owner, user };
  }

  describe("Deployment", function () {
    it("Should have the correct token name", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.read.name()).to.equal("My Token");
    });

    it("Should have the correct token symbol", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.read.symbol()).to.equal("MTK");
    });

    it("Should have the correct initial supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      expect(await token.read.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("Should assign the entire supply to the treasury", async function () {
      const { token, owner } = await loadFixture(deployTokenFixture);

      expect(
        await token.read.balanceOf([
          getAddress(owner.account.address),
        ])
      ).to.equal(TOTAL_SUPPLY);
    });

    it("Should reject a zero address treasury", async function () {
      await expect(
        hre.viem.deployContract("MyToken", [
          "0x0000000000000000000000000000000000000000",
        ])
      ).to.be.rejectedWith("Zero address");
    });
  });

  describe("Transfers", function () {
    it("Should transfer tokens to another account", async function () {
      const { token, user } = await loadFixture(deployTokenFixture);
      const amount = parseUnits("100", 18);

      const hash = await token.write.transfer([
        getAddress(user.account.address),
        amount,
      ]);

      await (await hre.viem.getPublicClient()).waitForTransactionReceipt({
        hash,
      });

      expect(
        await token.read.balanceOf([
          getAddress(user.account.address),
        ])
      ).to.equal(amount);
    });
  });

  describe("Burning", function () {
    it("Should burn tokens and reduce total supply", async function () {
      const { token } = await loadFixture(deployTokenFixture);
      const amount = parseUnits("1000", 18);

      await token.write.burn([amount]);

      expect(await token.read.totalSupply()).to.equal(
        TOTAL_SUPPLY - amount
      );
    });
  });

  describe("Permit", function () {
    it("Should approve spending using an off-chain signature", async function () {
      const { token, owner, user } = await loadFixture(deployTokenFixture);

      const publicClient = await hre.viem.getPublicClient();
      const chainId = await publicClient.getChainId();

      const block = await publicClient.getBlock();
      const deadline = block.timestamp + 3600n;

      const value = parseUnits("250", 18);

      const nonce = await token.read.nonces([
        getAddress(owner.account.address),
      ]);

      const spender = getAddress(user.account.address);

      const signature = await owner.signTypedData({
        account: owner.account,
        domain: {
          name: "My Token",
          version: "1",
          chainId,
          verifyingContract: token.address,
        },
        types: {
          Permit: [
            { name: "owner", type: "address" },
            { name: "spender", type: "address" },
            { name: "value", type: "uint256" },
            { name: "nonce", type: "uint256" },
            { name: "deadline", type: "uint256" },
          ],
        },
        primaryType: "Permit",
        message: {
          owner: getAddress(owner.account.address),
          spender,
          value,
          nonce,
          deadline,
        },
      });

      const parsed = parseSignature(signature);
      const v = parsed.v ?? parsed.yParity + 27;

      const hash = await token.write.permit([
        getAddress(owner.account.address),
        spender,
        value,
        deadline,
        v,
        parsed.r,
        parsed.s,
      ]);

      await publicClient.waitForTransactionReceipt({ hash });

      expect(
        await token.read.allowance([
          getAddress(owner.account.address),
          spender,
        ])
      ).to.equal(value);
    });
  });
});
