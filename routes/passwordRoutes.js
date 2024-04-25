const express = require("express");
const verifyUser = require("./../utils/verifyUser");
const PasswordInfo = require("../models/PasswordInfo");
const User = require("./../models/User");
const PasswordShareRequest = require("../models/PasswordShareRequest");
const cookieParser = require("cookie-parser");

const router = express.Router();
router.use(cookieParser());

router.post("/", verifyUser, async (req, res) => {
  const { url, password } = req.body;

  try {
    const newPasswordInfo = await PasswordInfo.create({
      url,
      password,
      user: req.id,
    });
    res.status(200).json({
      message: "Password added successfully",
      data: newPasswordInfo,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to add password" });
  }
});

router.get("/", verifyUser, async (req, res) => {
  try {
    const passwordInfos = await PasswordInfo.find({ user: req.id });

    return res.status(200).json(passwordInfos);
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

router.put("/:id", verifyUser, async (req, res) => {
  const { id } = req.params;

  try {
    const updatedPassword = await PasswordInfo.findByIdAndUpdate(id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!updatedPassword) {
      return res
        .status(404)
        .json({ message: "No password found with this id" });
    }

    res.status(200).json({
      message: "Password updated",
      data: updatedPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.delete("/:id", verifyUser, async (req, res) => {
  const { id } = req.params;
  try {
    const deletedPassword = await PasswordInfo.findByIdAndDelete(id);

    if (!deletedPassword) {
      return res
        .status(404)
        .json({ message: "No password found with this id" });
    }

    await PasswordShareRequest.deleteMany({ password: id });

    res.status(204).json({
      message: "Password deleted",
    });
  } catch (err) {
    res.status(404).json({
      message: err,
    });
  }
});

router.post("/share-request", verifyUser, async (req, res) => {
  const { receiverName, url } = req.body;

  try {
    if (req.username === receiverName) {
      return res.status(400).json({
        message: "You cannot share a password with yourself!",
      });
    }

    const receiver = await User.findOne({ username: receiverName });
    if (!receiver) {
      return res.status(404).json({
        message: "User not found!",
      });
    }
    const passwordInfo = await PasswordInfo.findOne({ url });
    if (!passwordInfo) {
      return res.status(404).json({
        message: "Password not found!",
      });
    }

    const newShareRequest = await PasswordShareRequest.create({
      sender: req.id,
      receiver: receiver._id,
      password: passwordInfo._id,
      status: "pending",
    });
    res.status(200).json({
      message: "Share request sent",
      data: newShareRequest,
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.get("/shared", verifyUser, async (req, res) => {
  try {
    const sharedRequests = await PasswordShareRequest.find({
      receiver: req.id,
      status: "accepted",
    });
    const sharedPasswords = await Promise.all(
      sharedRequests.map(async (request) => {
        const password = await PasswordInfo.findById(request.password);
        if (!password) {
          return null;
        }
        const userId = password.user;
        const { username } = await User.findOne({ _id: userId });
        return { ...password._doc, senderName: username };
      })
    );

    return res.status(200).json(sharedPasswords.flat());
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

router.put("/share-request/:id", verifyUser, async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedShareRequest = await PasswordShareRequest.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!updatedShareRequest) {
      return res
        .status(404)
        .json({ message: "No share request found with this id" });
    }

    const newAcceptedPassword = await PasswordInfo.findOne({
      _id: updatedShareRequest.password,
    });
    const userId = newAcceptedPassword.user;
    const { username } = await User.findOne({ _id: userId });
    const resPassword = { ...newAcceptedPassword._doc, senderName: username };

    res.status(200).json({
      message: "Share request updated",
      data: resPassword,
    });
  } catch (err) {
    res.status(500).json({ message: err });
  }
});

router.get("/pending-requests", verifyUser, async (req, res) => {
  try {
    const pendingRequests = await PasswordShareRequest.find({
      receiver: req.id,
      status: "pending",
    });
    const pendingPasswords = await Promise.all(
      pendingRequests.map(async (request) => {
        const password = await PasswordInfo.findById(request.password);
        const userId = password.user;
        const { username } = await User.findOne({ _id: userId });
        return {
          ...password._doc,
          senderName: username,
          requestId: request._id,
        };
      })
    );

    return res.status(200).json(pendingPasswords.flat());
  } catch (err) {
    return res.status(500).json({ message: err });
  }
});

module.exports = router;
