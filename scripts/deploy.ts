import { Wallet, NonceManager, BaseContract } from "ethers";
import { ethers, artifacts } from "hardhat";
import { RogueToken } from '../typechain-types';

async function createContract(contractName: string, wallet: Wallet) {
  const rogueToken = await artifacts.readArtifact(contractName);
  const abi = rogueToken.abi;
  const bytecode = rogueToken.bytecode;
  return new ethers.ContractFactory(abi, bytecode, wallet);
}

async function main() {
  const provider = new ethers.JsonRpcProvider("http://localhost:8545");

  const privateKey = "0xdf57089febbacf7ba0bc227dafbffa9fc08a93fdc68e1e42411a14efcf23656e"; // TODO use only for local dev
  const wallet = new ethers.Wallet(privateKey, provider);

  await wallet.getNonce();
  const rogueTokenFactory = await createContract("RogueToken", wallet);
  const rogueToken = await rogueTokenFactory.deploy() as RogueToken;
  await rogueToken.waitForDeployment();
  console.log(`Contract RogueToken deployed`);


  await wallet.getNonce();
  const agreementManagerFactory = await createContract("AgreementManager", wallet);
  const agreementManager = await agreementManagerFactory.deploy();
  await agreementManager.waitForDeployment();

  const agreementManagerContractAddress = await agreementManager.getAddress();
  console.log(`Contract AgreementManager deployed to: ${agreementManagerContractAddress}`);

  await wallet.getNonce();
  await rogueToken.setAuthorizedContract(agreementManagerContractAddress);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
