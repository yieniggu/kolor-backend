const { response } = require("express");
const { getMintedNFTs } = require("../helpers/landNFT");
const { offsetEmissions } = require("../helpers/marketplace");
const User = require("../models/User");

const newOffsetEmissions = async (req, res = response) => {
  try {
    const { tokenId, emissions, user } = req.body;

    console.log("body: ", req.body);

    const { address } = await User.findById(user.uid);
    //console.log("foundUser: ", foundUser);

    const receipt = await offsetEmissions(tokenId, emissions, address);

    res.status(401).json({
      ok: true,
      receipt,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      ok: false,
      msg: "Internal sv error",
    });
  }
};

const getPublishedLands = async (req, res = response) => {
  try {
    const mintedNFTs = await getMintedNFTs();
    const publishedNFTS = mintedNFTs.filter(
      (mintedNFT) => mintedNFT.state === "3"
    );

    return res.status(200).json({
      ok: true,
      publishedNFTS,
    });
  } catch (err) {
    console.error(err);

    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }
};

module.exports = {
  newOffsetEmissions,
  getPublishedLands,
};
