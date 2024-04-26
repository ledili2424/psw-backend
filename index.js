const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const authRouter = require("./routes/authRoutes.js");
const passwordRouter = require("./routes/passwordRoutes.js");


dotenv.config({ path: "./config.env" });

const app = express();
const port = process.env.PORT || 5000;

app.use(cors({ origin: "https://ledili-project3.onrender.com", credentials: true }));
app.use(express.json());

mongoose
  .connect(process.env.DATABASE)
  .then(() => console.log("connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.use("/api/auth", authRouter);
app.use("/api/password", passwordRouter);

app.listen(port, () => {
  console.log(`app listening on port ${port}`);
});
