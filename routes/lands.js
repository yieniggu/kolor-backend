const { Router } = require("express");
const { jwtValidator } = require("../middlewares/jwtValidator");

const { mintNFT, getNFTsMinted, updateState } = require("../controllers/lands");
const { isAdmin } = require("../helpers/isAdmin");

const router = new Router();

router.use(jwtValidator);

router.get("/", getNFTsMinted);

router.post("/", [isAdmin], mintNFT);

router.put("/:id/state", [isAdmin], updateState);

module.exports = router;
