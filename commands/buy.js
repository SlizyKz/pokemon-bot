const { EmbedBuilder } = require("discord.js");
const getUserAccount = require("../utils/getUserAccount");
const Pokemon = require("../models/Pokemon");
const getRandomPokemon = require("../utils/getRandomPokemon");
const isRare = require("../utils/isRare");
const checkMissionReset = require("../utils/checkMissionReset");

function randomPercent(min, max) {
  return Math.random() * (max - min) + min;
}

// 🔥 AHORA DEVUELVE IVS + PORCENTAJE
function generateIVsFromPercent(targetPercent) {

  const totalTarget = Math.floor((targetPercent / 100) * 186);

  let ivs = {
    hp: 0,
    attack: 0,
    defense: 0,
    spAttack: 0,
    spDefense: 0,
    speed: 0
  };

  const stats = Object.keys(ivs);
  const basePerStat = totalTarget / 6;
  let total = 0;

  for (let stat of stats) {
    let value = Math.floor(basePerStat + (Math.random() * 6 - 3));
    if (value < 0) value = 0;
    if (value > 31) value = 31;
    ivs[stat] = value;
    total += value;
  }

  let difference = totalTarget - total;

  while (difference !== 0) {
    for (let stat of stats) {
      if (difference === 0) break;

      if (difference > 0 && ivs[stat] < 31) {
        ivs[stat]++;
        difference--;
      }
      else if (difference < 0 && ivs[stat] > 0) {
        ivs[stat]--;
        difference++;
      }
    }
  }

  const finalTotal =
    ivs.hp + ivs.attack + ivs.defense +
    ivs.spAttack + ivs.spDefense + ivs.speed;

  return {
    ivs,
    percent: parseFloat(((finalTotal / 186) * 100).toFixed(2))
  };
}

async function getPokemonByRarity(wantRare) {
  while (true) {
    const random = getRandomPokemon();
    const rare = isRare(random.name);
    if (wantRare && rare) return random;
    if (!wantRare && !rare) return random;
  }
}

module.exports = async (message, args) => {

  if (!args[0])
    return message.reply("❌ Usa: p!buy normal | epic | ultra [cantidad]");

  const type = args[0].toLowerCase();
  const amount = parseInt(args[1]) || 1;

  if (amount < 1 || amount > 15)
    return message.reply("❌ Puedes abrir entre 1 y 15 cajas máximo.");

  const prices = {
    normal: 10000,
    epic: 75000,
    ultra: 320000
  };

  if (!prices[type])
    return message.reply("❌ Caja inválida.");

  const account = await getUserAccount(message.author.id);

  const totalCost = prices[type] * amount;

  if (account.balance < totalCost)
    return message.reply("❌ No tienes suficientes créditos.");

  account.balance -= totalCost;

  let shinyCount = 0;
  let rareCount = 0;
  let results = [];

  for (let i = 0; i < amount; i++) {

    let spawn;
    let shiny = false;
    let ivPercent;
    const roll = Math.random();

    /* NORMAL */
    if (type === "normal") {
      if (roll < 0.94) {
        spawn = await getPokemonByRarity(false);
        ivPercent = randomPercent(45, 65);
      } else {
        spawn = await getPokemonByRarity(true);
        ivPercent = randomPercent(55, 85);
      }
    }

    /* EPIC */
    else if (type === "epic") {
      if (roll < 0.75) {
        spawn = await getPokemonByRarity(false);
        ivPercent = randomPercent(65, 82);
      } else if (roll < 0.97) {
        spawn = await getPokemonByRarity(true);
        ivPercent = randomPercent(70, 85);
      } else {
        spawn = await getPokemonByRarity(false);
        shiny = true;
        ivPercent = randomPercent(60, 88);
      }
    }

    /* ULTRA */
    else if (type === "ultra") {
      if (roll < 0.60) {
        spawn = await getPokemonByRarity(true);
      } else if (roll < 0.85) {
        spawn = await getPokemonByRarity(false);
      } else {
        spawn = await getPokemonByRarity(true);
        shiny = true;
      }
      ivPercent = randomPercent(75, 100);
    }
    
const lastPokemon = await Pokemon.findOne({
  ownerId: message.author.id,
  pokemonId: { $exists: true }
}).sort({ pokemonId: -1 });

const newPokemonId =
  lastPokemon && !isNaN(lastPokemon.pokemonId)
    ? lastPokemon.pokemonId + 1
    : 1;

    // 🔥 NUEVO SISTEMA IVS
    const ivData = generateIVsFromPercent(ivPercent);

    await Pokemon.create({
      ownerId: message.author.id,
      pokemonId: newPokemonId,
      name: spawn.name,
      level: Math.floor(Math.random() * 40) + 1,
      gender: Math.random() < 0.5 ? "♂" : "♀",
      shiny,
      image: shiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${spawn.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spawn.id}.png`,

      ivs: ivData.ivs, // 🔥 GUARDAMOS LOS IVS

      ivPercent: ivData.percent
    });

    // 🎯 SISTEMA DE MISIONES
    if (account.missions && account.missions.length > 0) {

      for (let mission of account.missions) {

        if (mission.completed) continue;

        let progressAdded = false;

        if (mission.type === "open") {
          mission.progress += 1;
          progressAdded = true;
        }

        if (mission.type === "rare" && isRare(spawn.name)) {
          mission.progress += 1;
          progressAdded = true;
        }

        if (mission.type === "shiny" && shiny) {
          mission.progress += 1;
          progressAdded = true;
        }

        if (mission.progress > mission.target)
          mission.progress = mission.target;

        if (progressAdded && mission.progress >= mission.target && !mission.completed) {
          mission.completed = true;
          account.balance += mission.reward;

          message.channel.send(
            `🎯 **¡Misión completada!** (${mission.type})\n` +
            `💰 Ganaste ${mission.reward.toLocaleString()} créditos`
          );
        }
      }

      account.markModified("missions");
    }

    if (shiny) shinyCount++;
    if (isRare(spawn.name)) rareCount++;

    results.push(`${shiny ? "✨" : ""}${spawn.name} • ${ivData.percent}%`);
  }

  await account.save();

  const colors = {
    normal: 0x27ae60,
    epic: 0x8e44ad,
    ultra: 0xf39c12
  };

  const embed = new EmbedBuilder()
    .setColor(colors[type])
    .setTitle(`🎁 Apertura de ${amount} Caja(s) ${type.toUpperCase()}`)
    .setDescription(
      `💰 Costo total: **${totalCost.toLocaleString()}** créditos\n` +
      `⭐ Raros: **${rareCount}**\n` +
      `✨ Shinies: **${shinyCount}**`
    )
    .addFields({
      name: "📦 Resultados",
      value: results.join("\n")
    })
    .setFooter({ text: `Saldo restante: ${account.balance.toLocaleString()} créditos` })
    .setTimestamp();

  message.channel.send({ embeds: [embed] });
};
