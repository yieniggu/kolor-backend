const Web3 = require("web3");
const { NFTAbi } = require("../abis/NFT");
const { maxDecimalsOf, normalizeNumber } = require("../utils/web3Utils");

const web3 = new Web3("https://alfajores-forno.celo-testnet.org");

const createNFTContract = () => {
  const contract = new web3.eth.Contract(
    NFTAbi,
    "0x45C4071eF868Df5237069FF383964f8bA246D4FF"
  );

  return contract;
};

const createMarketplaceContract = () => {
  const contract = new web3.eth.Contract(
    marketplaceAbi,
    "0x27D0A8bB799eE3a0711Be76c5A11615F22d0Dd84"
  );

  return contract;
};

const safeMint = async ({ landAttributes }) => {
  let {
    toAddress,
    name,
    identifier,
    landOwnerAlias,
    size,
    country,
    stateOrRegion,
    city,
    initialTCO2,
  } = landAttributes;

  size = Number(size);
  landAttributes.size = Number(size);

  const decimals = maxDecimalsOf(landAttributes);

  const NFTContract = createNFTContract(NFTAbi);

  //console.log(NFTContract.methods);
  const encodedTransaction = await NFTContract.methods
    .safeMint(
      toAddress,
      name,
      identifier,
      toAddress,
      landOwnerAlias,
      decimals,
      normalizeNumber(size, decimals),
      country,
      stateOrRegion,
      city,
      normalizeNumber(initialTCO2, decimals)
    )
    .encodeABI();

  const gas = 480000;
  const gasPrice = web3.utils.toHex(await getGasPrice());
  const nonce = web3.utils.toHex(await getNonce());
  const { address } = web3.eth.accounts.privateKeyToAccount(
    process.env.DEV_PRIVATE_KEY
  );

  let txParams = {
    from: web3.utils.toChecksumAddress(address),
    to: "0x45C4071eF868Df5237069FF383964f8bA246D4FF",
    gas,
    gasPrice,
    nonce,
    data: encodedTransaction,
    common: {
      customChain: {
        chainId: 44787,
        networkId: 44787,
      },
    },
  };

  const signedTransaction = await web3.eth.accounts.signTransaction(
    txParams,
    process.env.DEV_PRIVATE_KEY
  );

  //console.log(signedTransaction);

  const receipt = await web3.eth.sendSignedTransaction(
    signedTransaction.raw || signedTransaction.rawTransaction
  );
  return receipt;
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
  safeMint,
};
