// import bcrypt from "bcryptjs";
// import User from "../models/userModel.js";
// import jwt from "jsonwebtoken";
// import { sendEmail } from "../utils/email.js";

const bcrypt = require("bcryptjs");
const User = require("../models/userModel.js");
const jwt = require("jsonwebtoken");
const { sendEmail } = require("../utils/email.js");

//Token handling
const generateToken = (user, res) => {
  const userId = {
    user: {
      id: user.id,
    },
  };

  const options = {
    expires: new Date(
      Date.now() + process.env.COOKIE_EXPIRE_TIME * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
    sameSite: "Strict",
  };

  jwt.sign(
    userId,
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE_TIME },
    (err, token) => {
      if (err) {
        console.error(`JWT Error: ${err}`);
        return res.status(500).json({ message: "Token generation failed" });
      }

      const modifiedUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        address: user.address,
        avatar: user.avatar,
      };

      res.status(201).cookie("token", token, options).json({
        success: true,
        user: modifiedUser,
        token,
      });
    }
  );
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
    let isEmail = /^[a-z]+[0-9]*@[a-z]+\.[a-z]+$/;
    if (!isEmail.test(email)) {
      return res.status(400).json({ message: "Please enter valid email" });
    }

    let ismobNum = /\d{10}/;
    if (!ismobNum.test(mobileNumber)) {
      res.status(400).json({ message: "Please enter valid Mobile number" });
    }

    const isEmailExists = await User.findOne({ email });
    if (isEmailExists) {
      return res
        .status(400)
        .json({ message: "User already exists, please login" });
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
    let isEmail = /^[a-z]+[0-9]*@[a-z]+\.[a-z]+$/;
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
    console.log(user);
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
  const id = req.userId;

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
  const id = req.userId;
  const { email, name, mobileNumber, address } = req.body;
  const image = req.file;

  try {
    let user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (email) {
      let isEmail = /^[a-z]+[0-9]*@[a-z]+\.[a-z]+$/;
      if (!isEmail.test(email)) {
        return res.status(400).json({ message: "Please enter valid email" });
      }
    }

    user = await User.findByIdAndUpdate(id, {
      email,
      name,
      mobileNumber,
      address,
      avatar: image ? image.filename : null,
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

    const resetToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
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

//------------------------ reset password ----------------------

exports.resetPassword = async (req, res) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  try {
    const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
    const user = await User.findOne({
      _id: decoded.id,
      resetPasswordToken: resetToken,
      resetPasswordTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res
        .status(400)
        .json({ message: "Password reset token is Invalid or expired" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;

    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
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

  const userId = req.userId;

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

    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
    });

    res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
