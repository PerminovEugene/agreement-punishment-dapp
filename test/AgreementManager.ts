const { expect } = require('chai');
import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { deployContract } from './utils';
import { loadFixture } from '@nomicfoundation/hardhat-toolbox/network-helpers';
import { Contract } from 'ethers';

describe.only('AgreementManager contract', function () {
  async function deploy() {
    return deployContract('AgreementManager');
  }
  async function setupAgreementManger() {
    return loadFixture(deploy);
  }

  async function deployRogueToken() {
    return deployContract('RogueToken');
  }
  async function setupRogueToken() {
    return loadFixture(deployRogueToken);
  }

  enum Status {
    Open = 0,
    BothFulfilled = 1,
    FirstFailed = 2,
    SecondFailed = 3,
    BothFailed = 4,
    Canceled = 5
  }

  type Agreement = {
    id: number;
    participant1: string;
    participant2: string;
    punishment: number;
    status: Status;
  };

  function createAgreementFixture(
    id: number,
    addr1: string,
    addr2: string,
    punishment: number,
    status: Status = Status.Open
  ): Agreement {
    return {
      id,
      participant1: addr1,
      participant2: addr2,
      punishment,
      status
    };
  }

  function contractResponseToAgreement(agreementData: any[]): Agreement {
    const [id, participant1, participant2, punishment, status] = agreementData;
    return createAgreementFixture(
      Number(id),
      participant1,
      participant2,
      Number(punishment),
      Number(status)
    );
  }

  let agreementManager: any, // Contract
    owner: HardhatEthersSigner,
    addr1: HardhatEthersSigner,
    addr2: HardhatEthersSigner,
    addr3: HardhatEthersSigner,
    addr4: HardhatEthersSigner,
    addr5: HardhatEthersSigner,
    addr6: HardhatEthersSigner;

  beforeEach(async () => {
    ({
      contract: agreementManager,
      owner,
      addr1,
      addr2,
      addr3,
      addr4,
      addr5,
      addr6
    } = await setupAgreementManger());
  });

  describe('Ownership', function () {
    it('Should set the right owner', async function () {
      expect(await agreementManager.owner()).to.equal(owner.address);
    });
  });

  describe('Agreement', function () {
    describe('Creation', function () {
      it('Should create agreement', async function () {
        await agreementManager.createAgreement(
          addr1.address,
          addr2.address,
          1000
        );

        const insertResult = await agreementManager.getAgreement(1);
        const parsedResult = contractResponseToAgreement(insertResult);
        const expected = createAgreementFixture(
          1,
          addr1.address,
          addr2.address,
          1000,
          Status.Open
        );
        expect(parsedResult).to.deep.equal(expected);
      });

      it('Should emit AgreementCreated event', async function () {
        agreementManager.createAgreement(addr1.address, addr2.address, 1);

        await expect(
          agreementManager.createAgreement(addr1.address, addr2.address, 1500)
        )
          .to.emit(agreementManager, 'AgreementCreated')
          .withArgs(2, addr1.address, addr2.address, 1500);
      });

      it('Should not allow to create agreement not authorised users', async function () {
        const connect = await agreementManager.connect(addr1);
        await expect(
          connect.createAgreement(addr1.address, addr2.address, 1)
        ).to.be.revertedWithCustomError(
          agreementManager,
          'OwnableUnauthorizedAccount'
        );
      });

      it('Should not allow to create agreement for identical addresses', async function () {
        await expect(
          agreementManager.createAgreement(addr1.address, addr1.address, 1)
        ).to.be.revertedWithCustomError(
          agreementManager,
          'InvalidAgreementParticipants'
        );
      });
    });

    describe('Get', function () {
      it('Should get agreement', async function () {
        await agreementManager.createAgreement(
          addr1.address,
          addr2.address,
          1000
        );
        await agreementManager.createAgreement(addr3.address, addr4.address, 1);
        await agreementManager.createAgreement(
          addr6.address,
          addr5.address,
          14
        );

        const getResult = await agreementManager.getAgreement(2);
        const parsedResult = contractResponseToAgreement(getResult);
        const expected = createAgreementFixture(
          2,
          addr3.address,
          addr4.address,
          1,
          Status.Open
        );
        expect(parsedResult).to.deep.equal(expected);
      });

      it('Should return InvalidAgreementId when id is incorrect', async function () {
        await agreementManager.createAgreement(addr1.address, addr2.address, 1);

        await expect(
          agreementManager.getAgreement(2)
        ).to.be.revertedWithCustomError(agreementManager, 'InvalidAgreementId');
      });
    });

    describe('Resolve', function () {
      it('Should not allow to create agreement not authorised users', async function () {
        const connect = await agreementManager.connect(addr1);
        await expect(
          connect.resolveAgreement(1, true, true)
        ).to.be.revertedWithCustomError(
          agreementManager,
          'OwnableUnauthorizedAccount'
        );
      });

      it('Should return AgreementIsNotOpen error when resolved agreement is not opened', async function () {
        await agreementManager.createAgreement(addr1.address, addr2.address, 1);
        await agreementManager.resolveAgreement(1, true, true);

        await expect(
          agreementManager.resolveAgreement(1, true, true)
        ).to.be.revertedWithCustomError(agreementManager, 'AgreementIsNotOpen');
      });

      it('Should return InvalidAgreementId when id is incorrect', async function () {
        await agreementManager.createAgreement(addr1.address, addr2.address, 1);

        await expect(
          agreementManager.resolveAgreement(2, true, true)
        ).to.be.revertedWithCustomError(agreementManager, 'InvalidAgreementId');
      });

      const tokens = 13031;
      [
        {
          firstFulfilled: true,
          secondFulfilled: true,
          status: Status.BothFulfilled,
          tokensFirst: 0,
          tokensSecond: 0
        },
        {
          firstFulfilled: false,
          secondFulfilled: true,
          status: Status.FirstFailed,
          tokensFirst: tokens,
          tokensSecond: 0
        },
        {
          firstFulfilled: true,
          secondFulfilled: false,
          status: Status.SecondFailed,
          tokensFirst: 0,
          tokensSecond: tokens
        },
        {
          firstFulfilled: false,
          secondFulfilled: false,
          status: Status.BothFailed,
          tokensFirst: tokens,
          tokensSecond: tokens
        }
      ].forEach(function ({
        firstFulfilled,
        secondFulfilled,
        status,
        tokensFirst,
        tokensSecond
      }) {
        const condition = { firstFulfilled, secondFulfilled };
        const expected = {
          status,
          tokensFirst,
          tokensSecond
        };

        describe(`Resolve: First fulfilled ${condition.firstFulfilled} and second fulfilled ${condition.secondFulfilled}`, function () {
          it('Should change agreement status to bothFulfilled', async function () {
            const { contract: rogueToken } = await setupRogueToken();
            agreementManager.setTokenProviderAddress(rogueToken);
            rogueToken.setAuthorizedContract(agreementManager);

            await agreementManager.createAgreement(
              addr1.address,
              addr2.address,
              tokens
            );
            await agreementManager.resolveAgreement(
              1,
              condition.firstFulfilled,
              condition.secondFulfilled
            );

            const getResult = await agreementManager.getAgreement(1);
            const parsedResult = contractResponseToAgreement(getResult);

            const expectedAgreement = createAgreementFixture(
              1,
              addr1.address,
              addr2.address,
              tokens,
              expected.status
            );
            expect(parsedResult).to.deep.equal(expectedAgreement);
          });

          it(`Should emit AgreementClosed event with ${expected.status} status`, async function () {
            const { contract: rogueToken } = await setupRogueToken();
            agreementManager.setTokenProviderAddress(rogueToken);
            rogueToken.setAuthorizedContract(agreementManager);

            await agreementManager.createAgreement(
              addr1.address,
              addr2.address,
              tokens
            );

            await expect(
              agreementManager.resolveAgreement(
                1,
                condition.firstFulfilled,
                condition.secondFulfilled
              )
            )
              .to.emit(agreementManager, 'AgreementClosed')
              .withArgs(1, addr1.address, addr2.address, expected.status);
          });

          it(`Should add ${expected.tokensFirst} to first address and ${expected.tokensSecond} to second address`, async function () {
            const { contract: rogueToken } = await setupRogueToken();
            agreementManager.setTokenProviderAddress(rogueToken);
            rogueToken.setAuthorizedContract(agreementManager);

            await agreementManager.createAgreement(
              addr1.address,
              addr2.address,
              tokens
            );
            await agreementManager.resolveAgreement(
              1,
              condition.firstFulfilled,
              condition.secondFulfilled
            );

            expect(await rogueToken.balanceOf(addr1.address)).to.equal(
              expected.tokensFirst
            );
            expect(await rogueToken.balanceOf(addr2.address)).to.equal(
              expected.tokensSecond
            );
          });
        });
      });
    });
    describe('Cancel', function () {
      const tokens = 13215353;
      it('Should not allow to cancel agreement not authorised users', async function () {
        const connect = await agreementManager.connect(addr1);
        await expect(connect.cancelAgreement(1)).to.be.revertedWithCustomError(
          agreementManager,
          'OwnableUnauthorizedAccount'
        );
      });
      it('Should return AgreementIsNotOpen error when canceled agreement is not opened', async function () {
        await agreementManager.createAgreement(addr1.address, addr2.address, 1);
        await agreementManager.cancelAgreement(1);

        await expect(
          agreementManager.cancelAgreement(1)
        ).to.be.revertedWithCustomError(agreementManager, 'AgreementIsNotOpen');
      });
      it('Should return InvalidAgreementId when id is incorrect', async function () {
        await agreementManager.createAgreement(addr1.address, addr2.address, 1);

        await expect(
          agreementManager.cancelAgreement(2)
        ).to.be.revertedWithCustomError(agreementManager, 'InvalidAgreementId');
      });
      it('Should cancel agreement and change status to canceled', async function () {
        await agreementManager.createAgreement(
          addr1.address,
          addr2.address,
          tokens
        );
        await agreementManager.cancelAgreement(1);

        const getResult = await agreementManager.getAgreement(1);
        const parsedResult = contractResponseToAgreement(getResult);

        const expectedAgreement = createAgreementFixture(
          1,
          addr1.address,
          addr2.address,
          tokens,
          Status.Canceled
        );
        expect(parsedResult).to.deep.equal(expectedAgreement);
      });
      it('Should cancel agreement and emit event', async function () {
        const { contract: rogueToken } = await setupRogueToken();
        agreementManager.setTokenProviderAddress(rogueToken);
        rogueToken.setAuthorizedContract(agreementManager);

        await agreementManager.createAgreement(
          addr1.address,
          addr2.address,
          tokens
        );

        await expect(agreementManager.cancelAgreement(1))
          .to.emit(agreementManager, 'AgreementCanceled')
          .withArgs(1, addr1.address, addr2.address);
      });
      it('Should cancel agreement and do not assign any tokens', async function () {
        const { contract: rogueToken } = await setupRogueToken();
        agreementManager.setTokenProviderAddress(rogueToken);
        rogueToken.setAuthorizedContract(agreementManager);

        await agreementManager.createAgreement(
          addr1.address,
          addr2.address,
          tokens
        );
        await agreementManager.cancelAgreement(1);

        expect(await rogueToken.balanceOf(addr1.address)).to.equal(0);
        expect(await rogueToken.balanceOf(addr2.address)).to.equal(0);
      });
    });
  });
});
