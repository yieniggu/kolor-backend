const Web3 = require("web3");
const { v4: uuidv4 } = require("uuid");

const {
  maxDecimalsOf,
  normalizeNumber,
  convertSpeciesToArray,
  convertPointsToArray,
} = require("../utils/web3Utils");
const { createNFTContract, getGasPrice, getNonce } = require("./web3Common");

const NFTContract = createNFTContract();
const web3 = new Web3("https://alfajores-forno.celo-testnet.org");
const burnAddress = "0x0000000000000000000000000000000000000000";

/* ############################ 

            GETTERS


   ############################          */

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
      //console.log(`nft info of token ${i}: `, NFTInfo);
      const species = await getSpecies(i);
      const points = await getPoints(i);

      NFTInfo.owner = owner;
      NFTInfo.species = species;
      NFTInfo.points = points;
      NFTInfo.tokenId = i;
      console.log("NFT ", i, NFTInfo);
      mintedNFTS.push(NFTInfo);
    } else {
      console.log("Token ", i, " is burned");
    }
  }

  return mintedNFTS;
};

/* Get nft info of a single land */
const getNFTInfo = async (tokenId) => {
  const owner = await NFTContract.methods.ownerOf(tokenId).call();

  let NFTInfo = await NFTContract.methods.getNFTInfo(tokenId).call();
  NFTInfo = extractNFTProps(NFTInfo);
  const species = await getSpecies(tokenId);
  const points = await getPoints(tokenId);

  NFTInfo.owner = owner;
  NFTInfo.species = species;
  NFTInfo.points = points;
  NFTInfo.tokenId = tokenId;

  return NFTInfo;
};

/* Gett all species of a given land */
const getSpecies = async (tokenId) => {
  const totalSpecies = await NFTContract.methods.totalSpeciesOf(tokenId).call();
  const species = [];
  for (let i = 0; i < totalSpecies; i++) {
    let specie = await NFTContract.methods.species(tokenId, i).call();
    specie = extractSpecieProps(specie);
    species.push(specie);
  }

  return species;
};

/* Get all points of a given land */
const getPoints = async (tokenId) => {
  const totalPoints = await NFTContract.methods.totalPointsOf(tokenId).call();
  const points = [];

  for (let i = 0; i < totalPoints; i++) {
    let point = await NFTContract.methods.points(tokenId, i).call();
    point = extractPointProps(point);
    points.push(point);
  }

  return points;
};

/* VCUs generated, projected and sold */
const getVCUs = async (tokenId) => {
  let NFTInfo = await NFTContract.methods.getNFTInfo(tokenId).call();
  NFTInfo = extractNFTProps(NFTInfo);
  //Generated VCUs
  const generatedVCUs = await NFTContract.methods
    .totalVCUSEmitedBy(tokenId)
    .call();
  //Sold VCUs
  const VCUsLeft = await NFTContract.methods.getVCUSLeft(tokenId).call();
  const soldTCO2 = generatedVCUs - VCUsLeft;
  //Projected VCUs
  const fiveYears = 157680000; //in seconds. Replace with liberation Date if implemented
  const timeElapsed = Math.floor(Date.now() / 1000) - NFTInfo.creationDate;
  const timeTotal = fiveYears - NFTInfo.creationDate;
  const projectedVCUs = (generatedVCUs * timeTotal) / timeElapsed;

  return {
    generatedVCUs: generatedVCUs,
    projectedVCUs: projectedVCUs,
    soldVCUs: soldTCO2,
  };
};

/* ############################ 

            SETTERS


   ############################          */

/* Mints a new land nft with given attributes */
const safeMint = async (landAttributes) => {
  let {
    toAddress,
    name,
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

  const identifier = uuidv4();
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
  console.log("mint nft receipt: ", receipt);
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

  //console.log(signedTransaction);

  const receipt = await web3.eth.sendSignedTransaction(
    signedTransaction.raw || signedTransaction.rawTransaction
  );

  console.log("update land state receipt: ", receipt);
  return receipt;
};

const setSpecies = async (tokenId, species) => {
  if (!species) return null;

  const { address } = web3.eth.accounts.privateKeyToAccount(
    process.env.DEV_PRIVATE_KEY
  );

  const speciesAsArrays = convertSpeciesToArray(species);
  console.log("sparrs: ", speciesAsArrays);

  const encodedTransaction = await NFTContract.methods
    .setSpecies(tokenId, speciesAsArrays)
    .encodeABI();

  const gas = 250000 * species.length;
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

  //console.log(signedTransaction);

  const receipt = await web3.eth.sendSignedTransaction(
    signedTransaction.raw || signedTransaction.rawTransaction
  );

  console.log("set species receipt: ", receipt);

  return receipt;
};

const setPoints = async (tokenId, points) => {
  if (!points) return null;
  const pointsAsArrays = convertPointsToArray(points);

  const { address } = web3.eth.accounts.privateKeyToAccount(
    process.env.DEV_PRIVATE_KEY
  );

  const encodedTransaction = await NFTContract.methods
    .setPoints(tokenId, pointsAsArrays)
    .encodeABI();

  const gas = 250000 * points.length;
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

  //console.log(signedTransaction);

  const receipt = await web3.eth.sendSignedTransaction(
    signedTransaction.raw || signedTransaction.rawTransaction
  );

  console.log("set points receipt: ", receipt);

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

const extractPointProps = (point) => {
  const { latitude, longitude, decimals } = point;

  return {
    latitude,
    longitude,
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
  setSpecies,
  setPoints,
  getVCUs,
  getNFTInfo,
};
