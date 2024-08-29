import express from "express";
import {
  changePassword,
  getSingleUser,
  loginUser,
  logoutUser,
  registerUser,
  updateUser,
} from "../controllers/userController.js";

const router = express.Router();

//User Registration
router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/getuser/:id", getSingleUser);
router.put("/update/:id", updateUser);
router.put("/change/password", changePassword);
router.post("/logout", logoutUser);

export default router;
