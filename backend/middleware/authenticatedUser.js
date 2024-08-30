const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

exports.isAuthenticatedUser = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res
      .status(401)
      .json({ message: "Please login to access this page" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.userId = decoded.user.id;

    req.user = await User.findById(req.userId);

    if (!req.user) {
      return res
        .status(404)
        .json({ message: "User not found, Please login again" });
    }
    next();
  } catch (error) {
    console.error(`Authentication error :${error}`);
    return res
      .status(401)
      .json({ message: "Invalid token, Please login again" });
  }
};
