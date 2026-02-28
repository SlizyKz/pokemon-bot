const getRandomPokemon = require("./utils/getRandomPokemon");
const activeSpawns = new Map();
const { EmbedBuilder } = require("discord.js");

const catchCommand = require("./commands/catch");
const pokemonCommand = require("./commands/pokemon");
const infoCommand = require("./commands/info");
const adminCommand = require("./commands/admin");
const balanceCommand = require("./commands/balance");
const giveCommand = require("./commands/give");
const shopCommand = require("./commands/shop");
const buyCommand = require("./commands/buy");
const hintCommand = require("./commands/hint");
const missionsCommand = require("./commands/missions");
const findCommand = require("./commands/find");
const marketCommand = require("./commands/market");
const selectCommand = require("./commands/select");
const orderCommand = require("./commands/order");

require("dotenv").config();
const { Client, GatewayIntentBits } = require("discord.js");
const mongoose = require("mongoose");

const PREFIX = "p!";

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("🟢 Conectado a MongoDB"))
  .catch(err => console.error(err));

client.once("ready", () => {
  console.log(`🟢 Bot conectado como ${client.user.tag}`);
});

setInterval(() => {
  client.guilds.cache.forEach(guild => {
    guild.channels.cache.forEach(channel => {
      if (!channel.isTextBased()) return;

      const pokemon = getRandomPokemon();
      const isShiny = require("./utils/isShiny")();

      const spawnData = {
        ...pokemon,
        shiny: isShiny,
        revealedLetters: [],
        spawnId: Date.now() + Math.random()
      };

      // 🔥 SOLO UN SPAWN POR CANAL
      activeSpawns.set(channel.id, spawnData);

      const image = isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

      const embed = new EmbedBuilder()
        .setTitle(isShiny ? "✨ ¡Un Pokémon Shiny apareció!" : "🌿 ¡Un Pokémon salvaje apareció!")
        .setDescription("Escribe `p!catch <nombre>` para atraparlo.")
        .setImage(image)
        .setColor(isShiny ? 0xffd700 : 0x2ecc71)
        .setFooter({ text: "Tienes 15 segundos para atraparlo." })
        .setTimestamp();

      channel.send({ embeds: [embed] });

      // 🔥 Expira después de 2 minutos
      setTimeout(() => {
        if (activeSpawns.get(channel.id)?.spawnId === spawnData.spawnId) {
          activeSpawns.delete(channel.id);
        }
      }, 120000);

    });
  });
}, 15000);

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (!message.content.startsWith(PREFIX)) return;

  const args = message.content.slice(PREFIX.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === "ping") {
    return message.reply("🏓 Pong!");
  }

  if (command === "pokemon") {
  return pokemonCommand(message);
}

if (command === "info") {
  return infoCommand(message, args);
}

  if (command === "catch") {
  return catchCommand(message, args, activeSpawns);
}

if (command === "admin") {
  return adminCommand(message, args, activeSpawns);
}

if (command === "balance") {
    return balanceCommand(message);
}

if (command === "give") {
    return giveCommand(message, args);
}
if (command === "shop") return shopCommand(message);
if (command === "buy") return buyCommand(message, args);

if (command === "hint") {
  return hintCommand(message, args, activeSpawns);
}

if (command === "missions") {
    return missionsCommand(message);
}

if (command === "find") {
    return findCommand(message, args);
}

if (command === "market") {
   return marketCommand(message, args);
}

if (command === "select") {
   return selectCommand(message, args);
}

if (command === "order") {
   return orderCommand(message, args);
}

});





client.login(process.env.TOKEN);
