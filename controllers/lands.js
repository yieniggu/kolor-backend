const { response } = require("express");
const { getMintedNFTs, updateLandState } = require("../helpers/landNFT");
const { safeMint } = require("../helpers/landNFT");

/* ############################ 

            GETTERS


   ############################          */

/* Returns all minted and not burned NFTS */
const getNFTsMinted = async (req, res = response) => {
  console.log(req.body);
  console.log(req.params);

  try {
    const mintedNFTs = await getMintedNFTs();
    return res.status(200).json({
      ok: true,
      mintedNFTs,
    });
  } catch (err) {
    console.error(err);

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
  const { landAttributes } = req.body;

  try {
    const mintingReceipt = await safeMint(landAttributes);
    //const addSpeciesReceipt = await addSpecies()

    return res.status(201).json({
      ok: true,
      receipts: [
        mintingReceipt,
        //addSpeciesReceipt
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

module.exports = { mintNFT, getNFTsMinted, updateState };
