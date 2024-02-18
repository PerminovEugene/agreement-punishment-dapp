
const { expect } = require("chai");
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { ethers } from "hardhat";
const {
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe.only("AgreementManager contract", function () {
  async function deployContract() {
    const [owner, addr1, addr2, addr3, addr4, addr5, addr6,] = await ethers.getSigners();

    const agreementManager = await ethers.deployContract("AgreementManager");
    await agreementManager.waitForDeployment();

    return { agreementManager, owner, addr1, addr2, addr3, addr4, addr5, addr6, };
  }

  enum Status {
    Open = 0,
    Closed = 1,
    Done = 2 
  }

  type Agreement = {
    id: number,
    participant1: HardhatEthersSigner,
    participant2: HardhatEthersSigner,
    punishment: number,
    status: Status,
  }

  function createAgreementFixture(
    id: number,
    addr1: HardhatEthersSigner,
    addr2: HardhatEthersSigner,
    punishment: number,
    status: Status = Status.Open,
  ): Agreement { return {
    id,
    participant1: addr1,
    participant2: addr2,
    punishment,
    status,
  }}
  
  function contractResponseToAgreement(agreementData: any[]): Agreement {
    const [ id, participant1, participant2, punishment, status ] = agreementData;
    return createAgreementFixture(
        Number(id),
        participant1,
        participant2,
        Number(punishment),
        Number(status),
    )
  }

  describe("Ownership", function () {
    it("Should set the right owner", async function () {
      const { agreementManager, owner } = await loadFixture(deployContract);
      expect(await agreementManager.owner()).to.equal(owner.address);
    });
  })

  describe("Agreement", function () {
    describe("Creation", function () {
      it("Should create agreement", async function () {
        const { agreementManager, addr1, addr2 } = await loadFixture(
          deployContract
        );
        await agreementManager.createAgreement(addr1.address, addr2.address, 1000);

        const insertResult = await agreementManager.getAgreement(1);
        const parsedResult = contractResponseToAgreement(insertResult);
        const expected = createAgreementFixture(
          1, addr1.address, addr2.address, 1000, Status.Open
        );
        expect(parsedResult).to.deep.equal(expected);
      });

      it("Should emit AgreementCreated event", async function () {
        const { agreementManager, addr1, addr2 } = await loadFixture(
          deployContract
        );
        agreementManager.createAgreement(addr1.address, addr2.address, 1);

        await expect(agreementManager.createAgreement(addr1.address, addr2.address, 1500))
          .to.emit(agreementManager, "AgreementCreated")
          .withArgs(2, addr1.address, addr2.address, 1500);
      });

      it("Should not allow to create agreement not authorised users", async function () {
        const { agreementManager, addr1, addr2 } = await loadFixture(
          deployContract
        );
        const connect = await agreementManager.connect(addr1)
        await expect(connect.createAgreement(addr1.address, addr2.address, 1))
          .to.be.revertedWithCustomError(agreementManager, 'OwnableUnauthorizedAccount');
      });
    
      it("Should not allow to create agreement for identical addresses", async function () {
        const { agreementManager, addr1 } = await loadFixture(
          deployContract
        );
        await expect(agreementManager.createAgreement(addr1.address, addr1.address, 1))
          .to.be.revertedWithCustomError(agreementManager, 'InvalidAgreementParticipants');
      });
    });

    describe("Get", function () {
      it("Should get agreement", async function () {
        const { agreementManager, addr1, addr2, addr3, addr4, addr5, addr6 } = await loadFixture(
          deployContract
        );
        await agreementManager.createAgreement(addr1.address, addr2.address, 1000);
        await agreementManager.createAgreement(addr3.address, addr4.address, 1);
        await agreementManager.createAgreement(addr6.address, addr5.address, 14);

        const getResult = await agreementManager.getAgreement(2);
        const parsedResult = contractResponseToAgreement(getResult);
        const expected = createAgreementFixture(
          2, addr3.address, addr4.address, 1, Status.Open
        );
        expect(parsedResult).to.deep.equal(expected);
      });

      it("Should return InvalidAgreementId when id is incorrect", async function () {
        const { agreementManager, addr1, addr2} = await loadFixture(
          deployContract
        );
        await agreementManager.createAgreement(addr1.address, addr2.address, 1);

        await expect(agreementManager.getAgreement(2))
          .to.be.revertedWithCustomError(agreementManager, 'InvalidAgreementId');
      });
    });
      
  });
});