import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox-viem";

import "@nomicfoundation/hardhat-toolbox";
import "@nomicfoundation/hardhat-ethers";

import 'solidity-coverage'

const config: HardhatUserConfig = {
  solidity: "0.8.20",
  networks: {
    hardhat: {
      gas: 3000,
      gasPrice: 1000,
      blockGasLimit: 100000000000
    }
  }
};

export default config;
