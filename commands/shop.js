const { EmbedBuilder } = require("discord.js");

module.exports = async (message) => {

  const embed = new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle("🛒 Tienda de Cajas Pokémon")
    .setDescription("Compra cajas usando `p!buy <tipo>`\n")

    .addFields(
      {
        name: "📦 Caja Normal — 10,000 💰",
        value:
          "• Pokémon **comunes**\n" +
          "• IV: **30% – 65%**\n" +
          "• ⭐ 2% probabilidad de Pokémon **raro** (IV aleatorios)",
      },

      {
        name: "📦 Caja Épica — 75,000 💰",
        value:
          "• Pokémon **comunes** IV **65% – 80%**\n" +
          "• ⭐ 25% probabilidad Pokémon **raro** (IV aleatorios)\n" +
          "• ✨ 15% probabilidad Pokémon **shiny común** (IV 30% – 55%)",
      },

      {
        name: "📦 Caja Ultra — 320,000 💰",
        value:
          "• 🟣 Mayormente Pokémon **raros** (IV 70% – 100%)\n" +
          "• 🔥 20% Pokémon común fuerte (IV 83% – 100%)\n" +
          "• ✨ 35% Shiny común (IV 60% – 100%)\n" +
          "• 💎 7% Shiny raro (IV aleatorios)",
      }
    )

    .setFooter({ text: "Sistema inspirado en Pokétwo • Economía competitiva" })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};
