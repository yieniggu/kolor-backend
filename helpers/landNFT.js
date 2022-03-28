const Web3 = require("web3");
const { maxDecimalsOf, normalizeNumber } = require("../utils/web3Utils");
const { createNFTContract, getGasPrice, getNonce } = require("./web3Common");

const NFTContract = createNFTContract();
const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
const burnAddress = "0x0000000000000000000000000000000000000000";

/* Get all minted species info one by one */
const getMintedNFTs = async () => {
  const mintedNFTS = [];
  //console.log(NFTContract.methods);
  const totalSupply = await NFTContract.methods.totalSupply().call();
  for (let i = 0; i < totalSupply; i++) {
    const owner = await NFTContract.methods.ownerOf(i).call();

    if (owner != burnAddress) {
      let NFTInfo = await NFTContract.methods.getNFTInfo(i).call();
      NFTInfo = extractNFTProps(NFTInfo);
      console.log(`nft info of token ${i}: `, NFTInfo);
      const species = await getSpecies(NFTContract, i);

      NFTInfo.owner = owner;
      NFTInfo.species = species;
      mintedNFTS.push(NFTInfo);
    } else {
      console.log("Token ", i, " is burned");
    }
  }

  return mintedNFTS;
};

/* Gett all species of a given land */
const getSpecies = async (contract, tokenId) => {
  const totalSpecies = await contract.methods.totalSpeciesOf(tokenId).call();
  const species = [];
  for (let i = 0; i < totalSpecies; i++) {
    let specie = await contract.methods.species(tokenId, i).call();
    specie = extractSpecieProps(specie);
    species.push(specie);
  }

  return species;
};

/* ############################ 

            SETTERS


   ############################          */

/* Mints a new land nft with given attributes */
const safeMint = async (landAttributes) => {
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

  const { address } = web3.eth.accounts.privateKeyToAccount(
    process.env.DEV_PRIVATE_KEY
  );

  //console.log(NFTContract.methods);
  const encodedTransaction = await NFTContract.methods
    .safeMint(
      address,
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

  let txParams = {
    from: web3.utils.toChecksumAddress(address),
    to: process.env.NFT_ADDRESS,
    gas,
    gasPrice,
    nonce,
    data: encodedTransaction,
  };

  // Signs transaction to execute with private key on backend side
  const signedTransaction = await web3.eth.accounts.signTransaction(
    txParams,
    process.env.DEV_PRIVATE_KEY
  );

  const receipt = await web3.eth.sendSignedTransaction(
    signedTransaction.raw || signedTransaction.rawTransaction
  );

  receipt.tokenId = parseInt(receipt.logs[0].topics[3]);
  return receipt;
};

const updateLandState = async (tokenId, state) => {
  const { address } = web3.eth.accounts.privateKeyToAccount(
    process.env.DEV_PRIVATE_KEY
  );

  const encodedTransaction = await NFTContract.methods
    .updateLandState(tokenId, state)
    .encodeABI();

  const gas = 480000;
  const gasPrice = web3.utils.toHex(await getGasPrice());
  const nonce = web3.utils.toHex(await getNonce());

  let txParams = {
    from: web3.utils.toChecksumAddress(address),
    to: process.env.NFT_ADDRESS,
    gas,
    gasPrice,
    nonce,
    data: encodedTransaction,
  };
  // Signs transaction to execute with private key on backend side
  const signedTransaction = await web3.eth.accounts.signTransaction(
    txParams,
    process.env.DEV_PRIVATE_KEY
  );

  console.log(signedTransaction);
  
  const receipt = await web3.eth.sendSignedTransaction(
    signedTransaction.raw || signedTransaction.rawTransaction
  );

  return receipt;
};

/* ############################ 

            UTILS


   ############################          */

/* Extract props to proper object type */
const extractSpecieProps = (specie) => {
  const {
    speciesAlias,
    scientificName,
    density,
    landId,
    size,
    TCO2perSecond,
    TCO2,
    creationDate,
    updateDate,
    decimals,
  } = specie;

  return {
    speciesAlias,
    scientificName,
    density,
    landId,
    size,
    TCO2perSecond,
    TCO2,
    creationDate,
    updateDate,
    decimals,
  };
};

/* Gets NFT props into proper object */
const extractNFTProps = (NFTInfo) => {
  const {
    identifier,
    landOwner,
    landOwnerAlias,
    name,
    size,
    country,
    city,
    stateOrRegion,
    creationDate,
    initialTCO2,
    currentTCO2,
    soldTCO2,
    decimals,
    state,
  } = NFTInfo;
  return {
    identifier,
    landOwner,
    landOwnerAlias,
    name,
    size,
    country,
    city,
    stateOrRegion,
    creationDate,
    initialTCO2,
    currentTCO2,
    soldTCO2,
    decimals,
    state,
  };
};

module.exports = {
  safeMint,
  getMintedNFTs,
  updateLandState,
};
