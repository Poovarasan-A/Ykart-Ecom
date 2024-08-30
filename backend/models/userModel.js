import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  mobileNumber: {
    type: Number,
    required: true,
    minLength: 10,
  },
  password: {
    type: String,
    required: true,
    minLength: 6,
  },
  avatar: {
    type: String,
    required: false,
  },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: Number,
    country: String,
  },
  isEmailVerified: {
    type: Boolean,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  updatedAt: {
    type: Date,
    default: Date.now(),
  },
  carts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cart",
    },
  ],
  shippingAddress: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shipping",
    },
  ],
  Orders: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
    },
  ],
  Payments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payment",
    },
  ],
  Reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  resetPasswordToken: String,
  resetPasswordTokenExpire: Date,
});

const User = mongoose.model("User", userSchema);

export default User;
