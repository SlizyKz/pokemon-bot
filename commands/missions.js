const { EmbedBuilder } = require("discord.js");
const getUserAccount = require("../utils/getUserAccount");
const checkMissionReset = require("../utils/checkMissionReset");

function formatTime(ms) {
  if (ms <= 0) return "Reiniciando...";

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return `${hours}h ${minutes}m ${seconds}s`;
}

module.exports = async (message) => {

  const account = await getUserAccount(message.author.id);

  // 🔁 Verifica si deben reiniciarse (usa lastMissionReset)
  await checkMissionReset(account);

  const embed = new EmbedBuilder()
    .setColor(0x3498db)
    .setTitle("🎯 Tus Misiones Diarias");

  if (!account.missions || account.missions.length === 0) {
    embed.setDescription("❌ No tienes misiones activas.");
    return message.channel.send({ embeds: [embed] });
  }

  // ⏳ Calcular tiempo restante usando lastMissionReset
  let timeLeft = "No disponible";
  let discordTimestamp = "";

  if (account.lastMissionReset) {

    const resetDate = new Date(account.lastMissionReset);
    const remaining = resetDate.getTime() - Date.now();

    timeLeft = formatTime(remaining);

    const resetTimestamp = Math.floor(resetDate.getTime() / 1000);
    discordTimestamp = `<t:${resetTimestamp}:R>`;
  }

  embed.setDescription(
    `⏳ **Se reinician en:** ${timeLeft}\n` +
    (discordTimestamp ? `🕒 ${discordTimestamp}\n\n` : "\n")
  );

  // 📜 Listar misiones
  account.missions.forEach((m, i) => {
    embed.addFields({
      name: `🎯 Misión ${i + 1}`,
      value:
        `Tipo: **${m.type.toUpperCase()}**\n` +
        `Progreso: **${m.progress}/${m.target}**\n` +
        `Recompensa: 💰 **${m.reward.toLocaleString()}**\n` +
        `Estado: ${m.completed ? "✅ Completada" : "⏳ En progreso"}`
    });
  });

  embed.setTimestamp();

  message.channel.send({ embeds: [embed] });
};
