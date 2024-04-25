const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./../models/User");
const cookieParser = require("cookie-parser");
const verifyUser = require("./../utils/verifyUser");

const saltRounds = 10;

const router = express.Router();

router.use(cookieParser());

router.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (password.length < 6) {
    return res.status(400).json({
      status: "fail",
      message: "Password must be at least 6 characters long!",
    });
  }

  try {
    const salt = bcrypt.genSaltSync(saltRounds);
    const hash = bcrypt.hashSync(password, salt);
    await User.create({
      username,
      password: hash,
    });

    res.status(201).json({
      status: "success",
      message: "User has been created",
    });
  } catch (err) {
    if (err.code == 11000 && err.keyPattern && err.keyPattern.username) {
      return res.status(400).json({
        status: "fail",
        message: "Username has been taken, please enter another name!",
      });
    }
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const isCorrectPsw = bcrypt.compareSync(password, user.password);
    if (!isCorrectPsw) {
      return res.status(400).json({
        status: "fail",
        message: "Wrong password!",
      });
    }

    const token = jwt.sign({ id: user._id, username }, process.env.JWT_SECRET);

    res
      .cookie("access_token", token)
      .status(200)
      .json({
        status: "success",
        data: {
          username: username,
          token,
        },
      });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err,
    });
  }
});

router.get("/profile", verifyUser, (req, res) => {
  return res
    .status(200)
    .json({ status: "success", username: req.username });
});

router.post("/logout", (req, res) => {
  res.clearCookie("access_token");
  res.status(200).json({ message: "Logged out successfully" });
});

module.exports = router;
