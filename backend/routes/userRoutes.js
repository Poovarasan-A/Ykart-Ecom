import express from "express";
import {
  changePassword,
  forgotPassword,
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controllers/userController.js";
import upload from "../middleware/upload.js";

const router = express.Router();

//User Registration
router.post("/register", upload.single("avatar"), registerUser);
router.post("/login", loginUser);
router.get("/getuser/:id", getSingleUser);
router.put("/update/:id", updateUser);
router.put("/change/password", changePassword);
router.post("/forgot/password", forgotPassword);
router.post("/logout", logoutUser);

export default router;
