const { Router } = require("express");
const {
  newOffsetEmissions,
  getPublishedLands,
} = require("../controllers/marketplace");
const { isAdmin } = require("../helpers/isAdmin");
const { jwtValidator } = require("../middlewares/jwtValidator");

const router = new Router();

router.get("/", getPublishedLands);

router.post("/", [jwtValidator, isAdmin], newOffsetEmissions);

module.exports = router;
