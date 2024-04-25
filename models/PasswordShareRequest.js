const mongoose = require("mongoose");

const PasswordShareRequestSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  receiver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  password: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PasswordInfo",
    required: true,
  },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
});

const PasswordShareRequest = mongoose.model(
  "PasswordShareRequest",
  PasswordShareRequestSchema
);
module.exports = PasswordShareRequest;
