const { response } = require("express");
const {
  getMintedNFTs,
  updateLandState,
  setSpecies,
  setPoints,
  getVCUs,
} = require("../helpers/landNFT");
const { safeMint } = require("../helpers/landNFT");
const { getInitialTCO2 } = require("../utils/web3Utils");

/* ############################ 

            GETTERS


   ############################          */

/* Returns all minted and not burned NFTS */
const getNFTsMinted = async (req, res = response) => {
  console.log(req.body);
  console.log(req.params);

  try {
    const mintedNFTs = await getMintedNFTs();
    const notPublishedNFTS = mintedNFTs.filter(
      (mintedNFT) => mintedNFT.state !== "3"
    );

    return res.status(200).json({
      ok: true,
      notPublishedNFTS,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

const getLandVCUs = async (req, res = response) => {
  //const { state } = req.body;
  const { id: tokenId } = req.params;

  try {
    receipt = await getVCUs(tokenId);

    return res.status(200).json({
      ok: true,
      receipt,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

/* ############################ 

            SETTERS


   ############################          */

const mintNFT = async (req, res = response) => {
  const { landAttributes, species, points } = req.body;

  try {
    const initialTCO2 = getInitialTCO2(species);
    landAttributes.initialTCO2 = initialTCO2;

    const mintingReceipt = await safeMint(landAttributes);

    const setSpeciesReceipt = await setSpecies(mintingReceipt.tokenId, species);
    const setPointsReceipt = await setPoints(mintingReceipt.tokenId, points);

    return res.status(201).json({
      ok: true,
      receipts: [
        { transaction: "Minting", mintingReceipt },
        { transaction: "Set Species", setSpeciesReceipt },
        { transaction: "Set Points", setPointsReceipt },
      ],
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

const updateState = async (req, res = response) => {
  const { state } = req.body;
  const { id: tokenId } = req.params;

  try {
    receipt = await updateLandState(tokenId, state);

    return res.status(200).json({
      ok: true,
      receipt,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

module.exports = { mintNFT, getNFTsMinted, updateState, getLandVCUs };
