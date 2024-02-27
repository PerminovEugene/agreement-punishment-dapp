import { Wallet } from 'ethers';
import { ethers, artifacts } from 'hardhat';
import { RogueToken } from '../typechain-types';

async function createContract(contractName: string, wallet: Wallet) {
  const rogueToken = await artifacts.readArtifact(contractName);
  const abi = rogueToken.abi;
  const bytecode = rogueToken.bytecode;
  return new ethers.ContractFactory(abi, bytecode, wallet);
}

async function main() {
  const provider = new ethers.JsonRpcProvider('http://localhost:8545');

  const privateKey = process.env.DEPLOY_ACCOUNT_PK;
  if (!privateKey || typeof privateKey !== 'string') {
    throw new Error('Invalid private key ' + privateKey);
  }
  const wallet = new ethers.Wallet(privateKey, provider);

  await wallet.getNonce();
  const rogueTokenFactory = await createContract('RogueToken', wallet);
  const rogueToken = (await rogueTokenFactory.deploy()) as RogueToken;
  await rogueToken.waitForDeployment();
  console.log(`Contract RogueToken deployed`);

  await wallet.getNonce();
  const agreementManagerFactory = await createContract(
    'AgreementManager',
    wallet
  );
  const agreementManager = await agreementManagerFactory.deploy();
  await agreementManager.waitForDeployment();

  const agreementManagerContractAddress = await agreementManager.getAddress();
  console.log(
    `Contract AgreementManager deployed to: ${agreementManagerContractAddress}`
  );

  await wallet.getNonce();
  await rogueToken.setAuthorizedContract(agreementManagerContractAddress);
  console.log(`Authorised contract is updated for RogueToken`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
