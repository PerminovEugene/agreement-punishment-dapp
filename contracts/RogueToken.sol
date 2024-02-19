//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract RogueToken is Ownable {
  string public name = "Rogue Token";
  string public symbol = "RT";

  address private authorisedContract;

  mapping(address account => uint256) private _balances;

  event AddTokens(address indexed rougeAddress, uint256 amount);

  constructor() Ownable(msg.sender) {
    authorisedContract = address(0);
  }

  modifier onlyOwnerOrAuthorisedContract() {
    _checkOwnerOrAuthorisedContract();
    _;
  }

  function _checkOwnerOrAuthorisedContract() internal view {
    if (owner() != msg.sender && authorisedContract != msg.sender) {
      revert OwnableUnauthorizedAccount(msg.sender);
    }
  }

  function setAuthorizedContract(address _authorizedContract) public onlyOwner {
    authorisedContract = _authorizedContract;
  }

  function addTokens(
    address recipient,
    uint amount
  ) public onlyOwnerOrAuthorisedContract {
    if (_balances[recipient] == 0) {
      _balances[recipient] = amount;
    } else {
      _balances[recipient] += amount;
    }
    emit AddTokens(recipient, amount);
  }

  function balanceOf(address account) public view returns (uint256) {
    return _balances[account];
  }
}
