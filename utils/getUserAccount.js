const User = require("../models/User");

module.exports = async function getUserAccount(userId) {

  let account = await User.findOne({ userId: userId });

  if (!account) {
    account = await User.create({
      userId: userId,
      balance: 0,
      missions: [],
      lastMissionReset: null // 🔥 CORREGIDO
    });
  }

  return account;
};

