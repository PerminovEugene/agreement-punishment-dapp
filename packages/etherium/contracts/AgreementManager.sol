//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./IRogueToken.sol";

contract AgreementManager is Ownable(msg.sender) {
  enum Status {
    Open,
    BothFulfilled,
    FirstFailed,
    SecondFailed,
    BothFailed,
    Canceled
  }

  struct Agreement {
    uint id;
    address participant1;
    address participant2;
    uint punishment;
    Status status;
  }

  address private tokenProvider;
  Agreement[] private agreements;

  event AgreementCreated(
    uint id,
    address indexed _participant1,
    address indexed _participant2,
    uint256 punishment
  );

  event AgreementClosed(
    uint id,
    address indexed _participant1,
    address indexed _participant2,
    Status status
  );

  event AgreementCanceled(
    uint id,
    address indexed _participant1,
    address indexed _participant2
  );

  error InvalidAgreementId(uint id);
  error InvalidAgreementParticipants();
  error AgreementIsNotOpen(uint id);

  function setTokenProviderAddress(address _tokenProvider) external onlyOwner {
    tokenProvider = _tokenProvider;
  }

  /**
   * A function to create agreement between 2 addreses.
   */
  function createAgreement(
    address participant1,
    address participant2,
    uint256 punishAmount
  ) external onlyOwner {
    if (participant1 == participant2) {
      revert InvalidAgreementParticipants();
    }
    Agreement memory newAgreement = Agreement({
      id: agreements.length + 1,
      participant1: participant1,
      participant2: participant2,
      status: Status.Open,
      punishment: punishAmount
    });
    agreements.push(newAgreement);
    emit AgreementCreated(
      newAgreement.id,
      participant1,
      participant2,
      punishAmount
    );
  }

  function getAgreement(uint id) public view returns (Agreement memory) {
    if (id > agreements.length) {
      revert InvalidAgreementId(id);
    }
    return agreements[id - 1];
  }
  function setAgreementStatus(uint id, Status status) private {
    agreements[id - 1].status = status;
  }
  function isAgreementOpen(Agreement memory agreement) private pure {
    if (agreement.status != Status.Open) {
      revert AgreementIsNotOpen(agreement.id);
    }
  }

  function resolveAgreement(
    uint256 id,
    bool participant1FulfilledAgreement,
    bool participant2FulfilledAgreement
  ) external onlyOwner {
    Agreement memory agreement = getAgreement(id);
    isAgreementOpen(agreement);

    Status status = calculateStatus(
      participant1FulfilledAgreement,
      participant2FulfilledAgreement
    );

    if (!participant1FulfilledAgreement) {
      IRogueToken tokenContract = IRogueToken(tokenProvider);
      tokenContract.addTokens(agreement.participant1, agreement.punishment);
    }
    if (!participant2FulfilledAgreement) {
      IRogueToken tokenContract = IRogueToken(tokenProvider);
      tokenContract.addTokens(agreement.participant2, agreement.punishment);
    }
    emit AgreementClosed(
      agreement.id,
      agreement.participant1,
      agreement.participant2,
      status
    );
    setAgreementStatus(id, status);
  }

  function calculateStatus(
    bool fulfiled1,
    bool fulfiled2
  ) internal pure returns (Status) {
    bool bothFulfiled = fulfiled1 && fulfiled2;
    bool secondFailed = fulfiled1 && !fulfiled2;
    bool firstFailed = !fulfiled1 && fulfiled2;

    Status result;
    if (bothFulfiled) {
      result = Status.BothFulfilled;
    } else if (firstFailed) {
      result = Status.FirstFailed;
    } else if (secondFailed) {
      result = Status.SecondFailed;
    } else {
      result = Status.BothFailed;
    }
    return result;
  }

  function cancelAgreement(uint256 id) external onlyOwner {
    Agreement memory agreement = getAgreement(id);
    isAgreementOpen(agreement);
    setAgreementStatus(id, Status.Canceled);
    emit AgreementCanceled(id, agreement.participant1, agreement.participant2);
  }
}
