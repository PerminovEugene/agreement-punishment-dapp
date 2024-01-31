//SPDX-License-Identifier: UNLICENSED

// Solidity files have to start with this pragma.
// It will be used by the Solidity compiler to validate its version.
pragma solidity ^0.8.0;


// This is the main building block for smart contracts.
contract Token {
    // Some string type variables to identify the token.
    string public name = "Rouge Token";
    string public symbol = "RT";

    // The fixed amount of tokens, stored in an unsigned integer type variable.
    uint256 public totalSupply = 10000000000000;

    // An address type variable is used to store ethereum accounts.
    address public owner;

    // A mapping is a key/value map. Here we store each account's balance.
    mapping(address => uint256) balances;

    // // The Transfer event helps off-chain applications understand
    // // what happens within your contract.


    enum Status { Open, Closed, Canceled }

    struct Agreement {
        uint id;
        address participant1;
        address participant2;
        Status status;
        uint punishment;
    }

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
      address indexed _participant2
    );

    event AgreementCanceled(
      uint id,
      address indexed _participant1,
      address indexed _participant2
    );

    constructor() {
        owner = msg.sender;
    }


    /**
     * A function to create agreement between 2 addreses.
     */
    function createAgreement(
      address participant1,
      address participant2,
      uint256 punishAmount
    ) external {
      Agreement memory newAgreement = Agreement({id: _id, name: _name});
      myStructs[_id] = newStruct;
       keys.push(_id);
        // balances[msg.sender] -= amount;
        // balances[to] += amount;
        // emit Transfer(msg.sender, to, amount);
    }

    function resolveAgreement(
      address participant1,
      bool participant1FulfilledAgreement,
      address participant2,
      bool participant2FulfilledAgreement
    ) external {
      
    }

    function balanceOf(address account) external view returns (uint256) {
      return balances[account];
    }
}