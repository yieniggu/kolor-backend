const { response } = require("express");
const { safeMint } = require("../helpers/web3Interaction");

const mintNFT = async (req, res = response) => {
  console.log(req.body);

  try {
    const receipt = await safeMint(req.body);

    return res.status(201).json({
      ok: true,
      receipt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      ok: false,
      msg: "Failed please reach an admin",
    });
  }
};

module.exports = { mintNFT };
