//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract AgreementManager is Ownable(msg.sender) {
    enum Status { Open, Done, Canceled }

    struct Agreement {
        uint id;
        address participant1;
        address participant2;
        Status status;
        uint punishment;
    }

    Agreement[] public agreements;

    event AgreementCreated(
      uint id,
      address indexed _participant1,
      address indexed _participant2,
      uint256 punishment
    );

    event AgreementClosed(
      uint id,
      address indexed _participant1,
      address indexed _participant2
    );

    event AgreementCanceled(
      uint id,
      address indexed _participant1,
      address indexed _participant2
    );

    error InvalidAgreementId(uint id);
    error AgreementIsNotOpen(uint id);


    /**
     * A function to create agreement between 2 addreses.
     */
    function createAgreement(
      address participant1,
      address participant2,
      uint256 punishAmount
    )  onlyOwner external {
      Agreement memory newAgreement = Agreement({
        id: agreements.length + 1,
        participant1: participant1,
        participant2: participant2,
        status: Status.Open,
        punishment: punishAmount
      });
      agreements.push(newAgreement);
      emit AgreementCreated(newAgreement.id, participant1, participant2, punishAmount);
    }

    function getAgreement(uint id) public view returns (Agreement memory) {
        require(id - 1 <= agreements.length, "InvalidAgreementId");
        return agreements[id - 1];
    }
    function isAgreementOpen(Agreement memory agreement) private pure {
        require(agreement.status != Status.Open, "AgreementIsNotOpen");
    }

    function resolveAgreement(
      uint256 id,
      bool participant1FulfilledAgreement,
      bool participant2FulfilledAgreement
    ) onlyOwner external {
        Agreement memory agreement = getAgreement(id);
        isAgreementOpen(agreement);

        if (!participant1FulfilledAgreement) {
            // TODO assignt tokens to p1
        }
        if (!participant2FulfilledAgreement) {
            // TODO assignt tokens to p2
        }
        agreement.status = Status.Done;
        emit AgreementClosed(agreement.id, agreement.participant1, agreement.participant2);
    }

    function canceledAgreement(
      uint256 id
    ) onlyOwner external {
        Agreement memory agreement = getAgreement(id);
        isAgreementOpen(agreement);
        agreement.status = Status.Canceled;
        emit AgreementCanceled(id, agreement.participant1, agreement.participant2);
    }
}