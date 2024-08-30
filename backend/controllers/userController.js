// import bcrypt from "bcryptjs";
// import User from "../models/userModel.js";
// import jwt from "jsonwebtoken";
// import { sendEmail } from "../utils/email.js";

const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email.js");

//Token handling

let jwtSecret = "JWWOAPAPODKAMCKAJCJACJACACMAC";

const generateToken = (user, res) => {
  console.log("User:", user);

  const payload = {
    user: {
      id: user.id,
    },
  };

  const options = {
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    httpOnly: true,
    sameSite: "Strict",
  };

  jwt.sign(payload, jwtSecret, { expiresIn: "1h" }, (err, token) => {
    if (err) {
      console.error(`JWT Error: ${err}`);
      return res.status(500).json({ message: "Token generation failed" });
    }

    res.status(201).cookie("token", token, options).json({
      success: true,
      user,
      token,
    });
  });
};

//-------------------------User Regsitration ---------------------
//email validation and check user exists
//password validation
//mobile Number Validation
//Password hashing
//user creation
//token generation

exports.registerUser = async (req, res) => {
  const { email, name, mobileNumber, password, address } = req.body;
  const image = req.file;

  try {
    let isEmail = /^[a-z]+@[a-z]+\.[a-z]+$/;

    if (!isEmail.test(email)) {
      return res.status(400).json({ message: "Please enter valid email" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      name,
      mobileNumber,
      password: hashedPassword,
      address,
      avatar: image ? image.filename : null,
    });

    generateToken(user, res);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//---------------------------------- Login user --------------------------------
//email validation
//checking user exist
//comparing password
//token genneration

exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    let isEmail = /^[a-z]+@[a-z]+\.[a-z]+$/;
    if (!isEmail.test(email)) {
      return res.status(400).json({ message: "Please enter a valid email" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // Generate JWT and set it as a cookie
    generateToken(user, res);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//---------------------- get one user ---------------------------------
//getting user ID from parameter
//finding user using id and ignoring password
//checking user existance
exports.getSingleUser = async (req, res) => {
  const { id } = req.params;

  try {
    const user = await User.findById(id).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//------------------------------ update user ---------------------------------
//getting userID from parameter
//finding user using id
//checking user existance
//email validation
//saving updated details
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { email, name, mobileNumber, address } = req.body;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      let isEmail = /^[a-z]+@[a-z]+\.[a-z]+$/;
      if (!isEmail.test(email)) {
        return res.status(400).json({ message: "Please enter valid email" });
      }
    }

    // user = await User.save({
    //   email,
    //   name,
    //   mobileNumber,
    //   address,
    // });

    user = await User.findByIdAndUpdate(id, {
      email,
      name,
      mobileNumber,
      address,
    });

    res.status(200).json({ message: "User updated successfully", user });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//------------------------------ forgot password ----------------------------------
//Finding user email existance
//generating reset token
//store token with expiration time
//create reset url
//create message with reset link
//send email with reset link

exports.forgotPassword = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  try {
    if (!user) {
      return res.status(404).json({ message: "User email not found" });
    }

    const resetToken = jwt.sign({ id: user._id }, jwtSecret, {
      expiresIn: "30m",
    });

    user.resetPasswordToken = resetToken;
    user.resetPasswordTokenExpire = Date.now() + 30 * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `http://localhost:5173/reset/password/${resetToken}`;

    console.log(resetUrl);

    const message = `Your password reset link is as follows:\n\n${resetUrl}\n\nIf you have not requested this, please ignore this email.`;

    await sendEmail({
      email: user.email,
      subject: "E com password recovery",
      message,
    });

    return res
      .status(200)
      .json({ message: `Email sent to ${user.email} successfully` });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    await user.save({ validateBeforeSave: false });

    return res.status(500).json({ message: error.message });
  }
};

//------------------------------- Logout user --------------------------------
//set cookie expire time 0
exports.logoutUser = (req, res) => {
  try {
    res.cookie("token", "", {
      expires: new Date(0),
      httpOnly: true,
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//-------------------------- Change password -----------------------------
//getting logged user id
//findig user using id
//comparing new password with old password
//hashing password before saving
//updating new password

exports.changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user.id;
  console.log(userId);

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    await User.save({
      password: hashedNewPassword,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
