import bcrypt from "bcryptjs";
import User from "../models/userModel.js";
import jwt from "jsonwebtoken";

//Token handling

const generateToken = (user, res) => {
  console.log("User:", user);

  const payload = {
    user: {
      id: user.id,
    },
  };

  const jwtSecret = process.env.JWT_SECRET || "JWWOAPAPODKAMCKAJCJACJACACMAC";

  // Set cookie options
  const options = {
    expires: new Date(
      Date.now() + (process.env.COOKIE_EXPIRES_TIME || 7) * 24 * 60 * 60 * 1000
    ), // Default to 7 days if not set
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // Only send over HTTPS in production
    sameSite: "Strict", // Restrict the cookie to same-site requests
  };

  jwt.sign(payload, jwtSecret, { expiresIn: "1h" }, (err, token) => {
    if (err) {
      console.error(`JWT Error: ${err}`);
      return res.status(500).json({ message: "Token generation failed" });
    }

    // Set cookie and return response
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

export const registerUser = async (req, res) => {
  const { email, name, mobileNumber, password, address } = req.body;

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

export const loginUser = async (req, res) => {
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
export const getSingleUser = async (req, res) => {
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
export const updateUser = async (req, res) => {
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

    user = await User.save({
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

//------------------------------- Logout user --------------------------------
//set cookie expire time 0
export const logoutUser = (req, res) => {
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

export const changePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const userId = req.user.id;

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
