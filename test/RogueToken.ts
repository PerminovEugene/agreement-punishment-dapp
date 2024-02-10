
const { expect } = require("chai");
import { ethers } from "hardhat";
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe.only("RogueToken contract", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const rogueToken = await ethers.deployContract("RogueToken");
    await rogueToken.waitForDeployment();

    return { rogueToken, owner, addr1, addr2 };
  }

  describe("Ownership", function () {
    it("Should set the right owner", async function () {
      const { rogueToken, owner } = await loadFixture(deployTokenFixture);
      expect(await rogueToken.owner()).to.equal(owner.address);
    });
  
    it("Should set authorisedContract by owner", async function () {
      const { rogueToken, addr1 } = await loadFixture(deployTokenFixture);
      await rogueToken.setAuthorizedContract(addr1)
      expect(await rogueToken.authorisedContract()).to.equal(addr1);
    });

    it("Should not set authorisedContract by not owner", async function () {
      const { rogueToken, addr1, addr2 } = await loadFixture(deployTokenFixture);
      const connect = await rogueToken.connect(addr1)
      await expect(connect.setAuthorizedContract(addr2)).to.be.revertedWithCustomError(rogueToken, 'OwnableUnauthorizedAccount');
    });
  })

  describe("Transactions", function () {
    it("Should add tokens to recepient by owner", async function() {
      const { rogueToken, addr1 } = await loadFixture(
        deployTokenFixture
      );
      await rogueToken.addTokens(addr1.address, 50);
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(50);
    });
    it("Should add tokens to recepient by authorised contract", async function() {
      const { rogueToken, addr1 } = await loadFixture(
        deployTokenFixture
      );
      await rogueToken.setAuthorizedContract(addr1)
      const authorisedContract = await rogueToken.connect(addr1);

      await authorisedContract.addTokens(addr1.address, 50);
      expect(await authorisedContract.balanceOf(addr1.address)).to.equal(50);
    });
    it("Should throw error during adding tokens by unfamiliar address", async function() {
      const { rogueToken, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );
      await rogueToken.setAuthorizedContract(addr1)
      const authorisedContract = await rogueToken.connect(addr2);
      
      await (expect(authorisedContract.addTokens(addr1.address, 50))).to.be.revertedWithCustomError(rogueToken, 'OwnableUnauthorizedAccount');
    });
    it("Should detect overflow error", async function() {
      const { rogueToken, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const maxUint = ethers.MaxUint256;

      await rogueToken.addTokens(addr1.address, maxUint);
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(maxUint);

      await (expect(rogueToken.addTokens(addr1.address, 1))).to.be.revertedWith('Arithmetic operation overflowed outside of an unchecked block');
    });
    it("Should correctly handle several addTokens balances", async function() {
      const { rogueToken, addr1 } = await loadFixture(
        deployTokenFixture
      );
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(0);

      await rogueToken.addTokens(addr1.address, 25);
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(25);

      await rogueToken.addTokens(addr1.address, 1);
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(26);
    });

    it("Should emit Add token events", async function () {
      const { rogueToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      await expect(rogueToken.addTokens(addr1.address, 50))
        .to.emit(rogueToken, "AddTokens")
        .withArgs(addr1.address, 50);
    });
  });
});