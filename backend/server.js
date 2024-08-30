const express = require("express");
// import express from "express";
const connectDB = require("./db.js");
const user = require("./routes/userRoutes.js");
const dotenv = require("dotenv");

// import connectDB from "./db.js";
// import user from "./routes/userRoutes.js";
// import dotenv from "dotenv";

dotenv.config();
// console.log(process.env);

const app = express();

app.use(express.json());
app.use("/api/ykart/", user);

connectDB();

const port = process.env.PORT;
console.log(port);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
