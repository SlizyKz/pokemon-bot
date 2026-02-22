const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require("discord.js");

const Pokemon = require("../models/Pokemon");

module.exports = async (message) => {

  const pokemons = await Pokemon
    .find({ ownerId: message.author.id })
    .sort({ pokemonId: 1 });

  if (!pokemons.length) {
    return message.reply("❌ No tienes Pokémon capturados.");
  }

  let page = 0;
  const perPage = 10;
  const totalPages = Math.ceil(pokemons.length / perPage);

  const generateEmbed = (page) => {
  const start = page * perPage;
  const current = pokemons.slice(start, start + perPage);

  const description = current.map((p) => {
    const shiny = p.shiny ? "✨ " : "";

    const name = p.name.toUpperCase(); // 🔥 MAYÚSCULAS
    const level = p.level ? `Nv.${p.level}` : "Nv.?";
    const ivPercent = p.ivPercent ? `${p.ivPercent}%` : "0%";

    return `**${p.pokemonId}.** ${shiny}**${name}** | ${level} | IV: ${ivPercent}`;
  }).join("\n");

  return new EmbedBuilder()
    .setColor(0x5865F2)
    .setTitle(`📦 Pokémon de ${message.author.username}`)
    .setDescription(description)
    .setFooter({ text: `Página ${page + 1} / ${totalPages}` })
    .setTimestamp();
};

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("prev")
      .setLabel("⬅️")
      .setStyle(ButtonStyle.Primary),
    new ButtonBuilder()
      .setCustomId("next")
      .setLabel("➡️")
      .setStyle(ButtonStyle.Primary)
  );

  const msg = await message.channel.send({
    embeds: [generateEmbed(page)],
    components: totalPages > 1 ? [row] : [],
  });

  if (totalPages <= 1) return;

  const collector = msg.createMessageComponentCollector({
    time: 60000,
  });

  collector.on("collect", async (interaction) => {

    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        content: "❌ No puedes usar estos botones.",
        ephemeral: true,
      });
    }

    if (interaction.customId === "prev") {
      page = page > 0 ? --page : totalPages - 1;
    }

    if (interaction.customId === "next") {
      page = page + 1 < totalPages ? ++page : 0;
    }

    await interaction.update({
      embeds: [generateEmbed(page)],
      components: [row],
    });
  });

  collector.on("end", async () => {
    const disabledRow = new ActionRowBuilder().addComponents(
      row.components.map(button =>
        ButtonBuilder.from(button).setDisabled(true)
      )
    );

    await msg.edit({ components: [disabledRow] });
  });
};