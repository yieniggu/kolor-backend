const Web3 = require("web3");
const { NFTAbi } = require("../abis/NFT");
const { maxDecimalsOf, normalizeNumber } = require("../utils/web3Utils");

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

const createNFTContract = () => {
  const contract = new web3.eth.Contract(
    NFTAbi,
    "0x8b9eaEBEb8E097Fc2b9B637ab73170161677a385"
  );

  return contract;
};

const createMarketplaceContract = () => {
  const contract = new web3.eth.Contract(
    marketplaceAbi,
    "0x69c6059644de90bE598727431120467ee0acC5B4"
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
  createNFTContract,
  createMarketplaceContract,
  getGasPrice,
  getNonce
};
