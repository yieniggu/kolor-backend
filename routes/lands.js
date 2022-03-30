const { Router } = require("express");
const { jwtValidator } = require("../middlewares/jwtValidator");

const { mintNFT, getNFTsMinted, updateState } = require("../controllers/lands");
const { isAdmin } = require("../helpers/isAdmin");

const router = new Router();

router.use(jwtValidator);

// Get all minted nfts that are not yet published
router.get("/", getNFTsMinted);

// Creates a new land and mint a new NFT
router.post("/", [isAdmin], mintNFT);

// Updates the state of an existing land
router.put("/:id/state", [isAdmin], updateState);

module.exports = router;
