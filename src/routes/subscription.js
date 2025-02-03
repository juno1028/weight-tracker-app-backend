const express = require("express");
const router = express.Router();
const User = require("../models/user");

// RevenueCat webhook handler
router.post("/webhook", async (req, res) => {
  try {
    const { event } = req.body;
    const { app_user_id, type } = event;

    let updateData = {};
    let user = await User.findOne({ appleUserId: app_user_id });

    switch (type) {
      case "INITIAL_PURCHASE":
      case "RENEWAL":
        updateData = {
          subscriptionStatus: "subscribed",
          subscriptionExpiryDate: new Date(event.period_type.ends_at),
        };
        break;

      case "CANCELLATION":
        updateData = {
          subscriptionStatus: "expired",
        };
        break;

      case "TRIAL_START":
        updateData = {
          subscriptionStatus: "trial",
          trialStartDate: new Date(),
          subscriptionExpiryDate: new Date(event.period_type.ends_at),
        };
        break;

      case "TRIAL_CONVERSION":
        updateData = {
          subscriptionStatus: "subscribed",
          subscriptionExpiryDate: new Date(event.period_type.ends_at),
        };
        break;
    }

    if (!user) {
      user = new User({
        appleUserId: app_user_id,
        ...updateData,
      });
      await user.save();
    } else {
      await User.findByIdAndUpdate(user._id, updateData);
    }

    res.status(200).json({ message: "Webhook processed successfully" });
  } catch (error) {
    console.error("Webhook error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user subscription status
router.get("/status/:userId", async (req, res) => {
  try {
    const user = await User.findOne({ appleUserId: req.params.userId });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      status: user.subscriptionStatus,
      expiryDate: user.subscriptionExpiryDate,
      trialStartDate: user.trialStartDate,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
