import express from "express";
import connectDB from "./db.js";
import user from "./routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use("/api/ykart/", user);

connectDB();

const port = 8000;
app.listen(port, () => {
  console.log(`Server listening on ${port}`);
});
