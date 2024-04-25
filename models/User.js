const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, "please tell us your name"],
    unique: [true, "name has been used"],
  },
  password: {
    type: String,
    required: [true, "please provide a password"],
    minlength: [6, "A password must have at least 6 chars"],
  },
});

const UserModel = mongoose.model("User", UserSchema);

module.exports = UserModel;
