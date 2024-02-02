const { expect } = require("chai");
const { ethers } = require("hardhat");
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("RogueToken contract", function () {
  async function deployTokenFixture() {
    const [owner, addr1, addr2] = await ethers.getSigners();

    const rogueToken = await ethers.deployContract("RogueToken");
    await rogueToken.waitForDeployment();

    return { rogueToken, owner, addr1, addr2 };
  }

  describe.only("Ownership", function () {
    it("Should set the right owner", async function () {
      const { rogueToken, owner } = await loadFixture(deployTokenFixture);
      expect(await rogueToken.owner()).to.equal(owner.address);
    });
  
    it("Should set authorisedContract by owner", async function () {
      const { rogueToken, addr1 } = await loadFixture(deployTokenFixture);
      await rogueToken.setAuthorizedContract(addr1)
      expect(await rogueToken.authorisedContract).to.equal(addr1);
    });

    it("Should not set authorisedContract by not owner", async function () {
      const { rogueToken, addr1, addr2 } = await loadFixture(deployTokenFixture);
      await rogueToken.connect(addr1)
        .setAuthorizedContract(addr2)
        .to.be.revertedWith("OwnableUnauthorizedAccount");
    });
  })

  describe("Transactions", function () {
    it("Should transfer tokens between accounts", async function() {
      const { rogueToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 50 tokens from owner to addr1
      await rogueToken.transfer(addr1.address, 50);
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(50);

      // Transfer 50 tokens from addr1 to addr2
      await rogueToken.connect(addr1).transfer(addr2.address, 50);
      expect(await rogueToken.balanceOf(addr2.address)).to.equal(50);
      expect(await rogueToken.balanceOf(addr1.address)).to.equal(0);

      // owner balance supply - transfered
      const ownerBalance = await rogueToken.balanceOf(owner.address);
      expect(await rogueToken.totalSupply()).to.equal(ownerBalance + BigInt(50));
    });

    it("Should emit Transfer events", async function () {
      const { rogueToken, owner, addr1, addr2 } = await loadFixture(
        deployTokenFixture
      );

      // Transfer 50 tokens from owner to addr1
      await expect(rogueToken.transfer(addr1.address, 50))
        .to.emit(rogueToken, "Transfer")
        .withArgs(owner.address, addr1.address, 50);

      // Transfer 50 tokens from addr1 to addr2
      await expect(rogueToken.connect(addr1).transfer(addr2.address, 50))
        .to.emit(rogueToken, "Transfer")
        .withArgs(addr1.address, addr2.address, 50);
    });
    
    it("Should fail if sender doesn't have enough tokens", async function () {
      const { rogueToken, owner, addr1 } = await loadFixture(
        deployTokenFixture
      );
      const initialOwnerBalance = await rogueToken.balanceOf(owner.address);

      // Try to send 1 token from addr1 (0 tokens) to owner.
      // `require` will evaluate false and revert the transaction.
      await expect(
        rogueToken.connect(addr1).transfer(owner.address, 1)
      ).to.be.revertedWith("Not enough tokens");

      // Owner balance shouldn't have changed.
      expect(await rogueToken.balanceOf(owner.address)).to.equal(
        initialOwnerBalance
      );
    });
  });
});