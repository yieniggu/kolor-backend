const { Router } = require("express");
const { check } = require("express-validator");
const { jwtValidator } = require("../middlewares/jwtValidator");

const { mintNFT } = require("../controllers/lands");

const router = new Router();

router.use(jwtValidator);

router.post("/", mintNFT);

module.exports = router;
