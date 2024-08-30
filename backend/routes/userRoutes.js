const express = require("express");

const {
  changePassword,
  forgotPassword,
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
  resetPassword,
} = require("../controllers/userController.js");
const upload = require("../middleware/upload.js");
const { isAuthenticatedUser } = require("../middleware/authenticatedUser.js");

const router = express.Router();

//User Registration
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/getuser", isAuthenticatedUser, getSingleUser);
router.put("/update", isAuthenticatedUser, updateUser);
router.put("/change/password", isAuthenticatedUser, changePassword);
router.post("/forgot/password", forgotPassword);
router.put("/reset/password/:resetToken", resetPassword);
router.post("/logout", logoutUser);

module.exports = router;
