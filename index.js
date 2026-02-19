const getRandomPokemon = require("./utils/getRandomPokemon");
const activeSpawns = new Map();

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

      if (!activeSpawns.has(channel.id)) {
        activeSpawns.set(channel.id, []);
      }

      const channelSpawns = activeSpawns.get(channel.id);

      const spawnData = {
        ...pokemon,
        shiny: isShiny,
        revealedLetters: [],
        spawnId: Date.now() + Math.random() // ID único
      };

      channelSpawns.push(spawnData);

      const image = isShiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${pokemon.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`;

      channel.send({
        content: isShiny
          ? "✨ **¡Un Pokémon Shiny apareció!**"
          : "🌿 **¡Un Pokémon salvaje apareció!**",
        files: [image],
      });

      // 🔥 OPCIONAL: eliminar después de 2 minutos
      setTimeout(() => {
        const updatedSpawns = activeSpawns.get(channel.id) || [];
        activeSpawns.set(
          channel.id,
          updatedSpawns.filter(p => p.spawnId !== spawnData.spawnId)
        );
      }, 120000); // 2 minutos
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
  return adminCommand(message, args);
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
  return hintCommand(message, activeSpawns);
}

if (command === "missions") {
    return missionsCommand(message);
}


});





client.login(process.env.TOKEN);
