const { Router } = require("express");
const { getTokenBalances } = require("../controllers/token");
const { jwtValidator, userValidator } = require("../middlewares/jwtValidator");

const router = new Router();

router.get("/:userId", [jwtValidator], getTokenBalances);

//router.get("/transactions", [jwtValidator], getTransactions);

module.exports = router;
