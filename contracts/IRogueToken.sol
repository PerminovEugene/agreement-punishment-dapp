//SPDX-License-Identifier: UNLICENSED

pragma solidity ^0.8.20;

interface IRogueToken {
  function getValue() external pure returns (uint);

  function setAuthorizedContract(address _authorizedContract) external;

  function addTokens(address recipient, uint amount) external;

  function balanceOf(address account) external view returns (uint256);
}
