import { HardhatEthersSigner } from '@nomicfoundation/hardhat-ethers/signers';
import { ethers } from 'hardhat';
import { Contract } from 'ethers';

export type ContractFixture = {
  owner: HardhatEthersSigner;
  addr1: HardhatEthersSigner;
  addr2: HardhatEthersSigner;
  addr3: HardhatEthersSigner;
  addr4: HardhatEthersSigner;
  addr5: HardhatEthersSigner;
  addr6: HardhatEthersSigner;
  contract: any; //Contract;
};

export async function deployContract(
  contractName: string
): Promise<ContractFixture> {
  const [owner, addr1, addr2, addr3, addr4, addr5, addr6] =
    await ethers.getSigners();

  const contract = await ethers.deployContract(contractName);
  await contract.waitForDeployment();

  return { contract, owner, addr1, addr2, addr3, addr4, addr5, addr6 };
}
