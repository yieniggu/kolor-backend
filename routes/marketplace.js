const { Router } = require("express");
const {
  newOffsetEmissions,
  getPublishedLands,
} = require("../controllers/marketplace");
const { isAdmin } = require("../helpers/isAdmin");
const { jwtValidator } = require("../middlewares/jwtValidator");

const router = new Router();

router.use(jwtValidator);

router.get("/", getPublishedLands);

router.post("/", [isAdmin], newOffsetEmissions);

module.exports = router;
