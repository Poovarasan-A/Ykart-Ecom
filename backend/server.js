const express = require("express");
const connectDB = require("./db.js");
const user = require("./routes/userRoutes.js");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(express.json());
app.use("/api/ykart/", user);

connectDB();

const port = process.env.PORT;
console.log(port);

app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
