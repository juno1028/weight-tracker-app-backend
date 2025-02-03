const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  appleUserId: {
    type: String,
    required: true,
    unique: true,
  },
  subscriptionStatus: {
    type: String,
    enum: ["free", "trial", "subscribed", "expired"],
    default: "free",
  },
  subscriptionExpiryDate: {
    type: Date,
  },
  trialStartDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

userSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("User", userSchema);
