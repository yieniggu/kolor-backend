const Web3 = require("web3");
const { marketplaceAbi } = require("../abis/Marketplace");
const { NFTAbi } = require("../abis/NFT");

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

const createWallet = async () => {
  const { address, privateKey } = await web3.eth.accounts.create();

  console.log(
    `new wallet created with address: ${address} - pk: ${privateKey}`
  );

  return { address, privateKey };
};

const createNFTContract = () => {
  const contract = new web3.eth.Contract(NFTAbi, process.env.NFT_ADDRESS);

  return contract;
};

const createMarketplaceContract = () => {
  const contract = new web3.eth.Contract(
    marketplaceAbi,
    process.env.MARKETPLACE_ADDRESS
  );

  return contract;
};

const getGasPrice = async () => {
  return await web3.eth.getGasPrice();
};

const getNonce = async () => {
  const { address: dev_address } = web3.eth.accounts.privateKeyToAccount(
    process.env.DEV_PRIVATE_KEY
  );

  console.log(dev_address);

  return await web3.eth.getTransactionCount(
    web3.utils.toChecksumAddress(dev_address)
  );
};

module.exports = {
  createWallet,
  createNFTContract,
  createMarketplaceContract,
  getGasPrice,
  getNonce,
};
