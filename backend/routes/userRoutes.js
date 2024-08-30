// import express from "express";
const express = require("express");

const {
  changePassword,
  forgotPassword,
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} = require("../controllers/userController.js");
const upload = require("../middleware/upload.js");

const router = express.Router();

//User Registration
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/getuser/:id", getSingleUser);
router.put("/update/:id", updateUser);
router.put("/change/password", changePassword);
router.post("/forgot/password", forgotPassword);
router.post("/logout", logoutUser);

module.exports = router;
// export default router;
