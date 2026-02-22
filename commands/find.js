const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

const pokedex = require("../data/pokedex.json");
const Pokemon = require("../models/Pokemon");
const rarityList = require("../utils/rarityList");

function getRegion(id) {
  if (id <= 151) return "Kanto";
  if (id <= 251) return "Johto";
  if (id <= 386) return "Hoenn";
  if (id <= 493) return "Sinnoh";
  if (id <= 649) return "Unova";
  if (id <= 721) return "Kalos";
  if (id <= 809) return "Alola";
  if (id <= 905) return "Galar";
  return "Paldea";
}

function getRarity(name) {
  if (rarityList.legendary.includes(name)) return "Legendary";
  if (rarityList.mythical.includes(name)) return "Mythical";
  if (rarityList.ultraBeast.includes(name)) return "Ultra Beast";
  return "Common";
}

module.exports = async (message, args) => {

  if (!args[0]) {
    return message.reply("❌ Usa: p!find <nombre>");
  }

  const searchName = args.join(" ").toLowerCase();

  const pokemon = pokedex.find(p =>
    p.name.english.toLowerCase() === searchName
  );

  if (!pokemon) {
    return message.reply("❌ Pokémon no encontrado.");
  }

  const total =
    pokemon.base.HP +
    pokemon.base.Attack +
    pokemon.base.Defense +
    pokemon.base["Sp. Attack"] +
    pokemon.base["Sp. Defense"] +
    pokemon.base.Speed;

  const rarity = getRarity(pokemon.name.english);
  const region = getRegion(pokemon.id);

  const rarityColors = {
    "Common": 0x2ECC71,
    "Legendary": 0xF1C40F,
    "Mythical": 0x9B59B6,
    "Ultra Beast": 0x3498DB
  };

  const caughtCount = await Pokemon.countDocuments({
    ownerId: message.author.id,
    name: pokemon.name.english
  });

  let isShinyView = false;

  const generateEmbed = () => {

    const image = isShinyView
      ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/shiny/${pokemon.id}.png`
      : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemon.id}.png`;

    return new EmbedBuilder()
      .setColor(isShinyView ? 0xFFD700 : rarityColors[rarity])
      .setTitle(`#${pokemon.id} — ${pokemon.name.english} ${isShinyView ? "✨" : ""}`)
      .setDescription(
        `**Rarity**\n${rarity}\n\n` +
        `**Types**\n${pokemon.type.join(" / ")}\n\n` +
        `**Region**\n${region}\n\n` +
        `**Catchable**\nYes`
      )
      .addFields({
        name: "Base Stats",
        value:
          `HP: ${pokemon.base.HP}\n` +
          `Attack: ${pokemon.base.Attack}\n` +
          `Defense: ${pokemon.base.Defense}\n` +
          `Sp. Atk: ${pokemon.base["Sp. Attack"]}\n` +
          `Sp. Def: ${pokemon.base["Sp. Defense"]}\n` +
          `Speed: ${pokemon.base.Speed}\n` +
          `Total: ${total}`
      })
      .setImage(image)
      .setFooter({
        text: `You've caught ${caughtCount} of this Pokémon!`
      })
      .setTimestamp();
  };

  const row = new ActionRowBuilder().addComponents(
    new ButtonBuilder()
      .setCustomId("toggle_shiny")
      .setLabel("✨ Toggle Shiny")
      .setStyle(ButtonStyle.Secondary)
  );

  const msg = await message.channel.send({
    embeds: [generateEmbed()],
    components: [row]
  });

  const collector = msg.createMessageComponentCollector({
    time: 60000
  });

  collector.on("collect", async interaction => {

    if (interaction.user.id !== message.author.id) {
      return interaction.reply({
        content: "❌ Solo quien ejecutó el comando puede usar este botón.",
        ephemeral: true
      });
    }

    isShinyView = !isShinyView;

    await interaction.update({
      embeds: [generateEmbed()],
      components: [row]
    });
  });

  collector.on("end", async () => {

    const disabledRow = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("toggle_shiny")
        .setLabel("✨ Toggle Shiny")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true)
    );

    msg.edit({ components: [disabledRow] }).catch(() => {});
  });
};