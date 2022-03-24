const { response } = require("express");
const jwt = require("jsonwebtoken");

const jwtValidator = (req, res = response, next) => {
  // x-token in headers
  const token = req.header("x-token");

  if (!token) {
    return res.status(401).json({
      ok: false,
      msg: "Missing token on request",
    });
  }

  try {
    const { uid, name } = jwt.verify(token, process.env.SECRET_JWT_SEED);

    req.uid = uid;
    req.name = name;
  } catch (err) {
    console.error(err);
    return res.status(401).json({
      ok: false,
      msg: "Invalid token",
    });
  }

  next();
};

module.exports = {
  jwtValidator,
};
