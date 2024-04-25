const mongoose = require("mongoose");

const passwordInfoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref:"User",
    required: true,
  },
});

const PasswordInfo = mongoose.model("PasswordInfo", passwordInfoSchema);

module.exports = PasswordInfo;
