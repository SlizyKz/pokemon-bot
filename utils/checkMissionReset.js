const generateMissions = require("./generateMissions");

module.exports = async function checkMissionReset(account) {

  const now = Date.now();

  // 🔹 Usuario nuevo
  if (!account.lastMissionReset) {
    account.missions = generateMissions();
    account.lastMissionReset = new Date(now + 24 * 60 * 60 * 1000);
    await account.save();
    return;
  }

  // 🔹 Si ya venció el tiempo
  if (now >= new Date(account.lastMissionReset).getTime()) {
    account.missions = generateMissions();
    account.lastMissionReset = new Date(now + 24 * 60 * 60 * 1000);
    await account.save();
  }
};
