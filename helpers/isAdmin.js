const User = require("../models/User");

const isAdmin = async (req, res, next) => {
  try {
    const { role } = await User.findById(req.uid);

    if (role !== "admin") {
      return res.status(400).json({
        ok: false,
        msg: "Forbidden",
      });
    }
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      msg: "Internal server error",
    });
  }

  next();
};

module.exports = { isAdmin };
