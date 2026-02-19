const Pokemon = require("../models/Pokemon");
const getUserAccount = require("../utils/getUserAccount");
const checkMissionReset = require("../utils/checkMissionReset");
const isRare = require("../utils/isRare");

module.exports = async (message, args, activeSpawns) => {

    const channelSpawns = activeSpawns.get(message.channel.id);

    if (!channelSpawns || channelSpawns.length === 0) {
        return message.reply("❌ No hay ningún Pokémon para capturar.");
    }

    const guess = args.join(" ").toLowerCase();

    // 🔎 Buscar el Pokémon correcto dentro del array
    const spawnIndex = channelSpawns.findIndex(
        p => p.name.toLowerCase() === guess
    );

    if (spawnIndex === -1) {
        return message.reply("❌ Ese no es el Pokémon correcto.");
    }

    const spawn = channelSpawns[spawnIndex];

    const level = Math.floor(Math.random() * 40) + 1;
    const gender = Math.random() < 0.5 ? "♂" : "♀";

    const ivs = {
        hp: Math.floor(Math.random() * 32),
        attack: Math.floor(Math.random() * 32),
        defense: Math.floor(Math.random() * 32),
        spAttack: Math.floor(Math.random() * 32),
        spDefense: Math.floor(Math.random() * 32),
        speed: Math.floor(Math.random() * 32),
    };

    const totalIV =
        ivs.hp +
        ivs.attack +
        ivs.defense +
        ivs.spAttack +
        ivs.spDefense +
        ivs.speed;

    const ivPercent = ((totalIV / 186) * 100).toFixed(2);

    const image = spawn.shiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${spawn.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spawn.id}.png`;

    await Pokemon.create({
        ownerId: message.author.id,
        name: spawn.name,
        level,
        gender,
        shiny: spawn.shiny,
        image,
        ivs,
        stats: spawn.baseStats,
        ivPercent: parseFloat(ivPercent)
    });

    const account = await getUserAccount(message.author.id);

    await checkMissionReset(account);

    const reward = spawn.shiny ? 500 : 50;
    account.balance += reward;

    // ================================
    // 🎯 SISTEMA DE MISIONES
    // ================================

    if (account.missions && account.missions.length > 0) {

        for (let mission of account.missions) {

            if (mission.completed) continue;

            let progressAdded = false;

            if (mission.type === "catch") {
                mission.progress += 1;
                progressAdded = true;
            }

            if (mission.type === "rare" && isRare(spawn.name)) {
                mission.progress += 1;
                progressAdded = true;
            }

            if (mission.type === "shiny" && spawn.shiny) {
                mission.progress += 1;
                progressAdded = true;
            }

            if (mission.progress > mission.target) {
                mission.progress = mission.target;
            }

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

    await account.save();

    // 🗑 Eliminar SOLO el Pokémon capturado
    channelSpawns.splice(spawnIndex, 1);

    if (channelSpawns.length === 0) {
        activeSpawns.delete(message.channel.id);
    } else {
        activeSpawns.set(message.channel.id, channelSpawns);
    }

    message.channel.send(
        `🎉 **¡Felicidades ${message.author}!**\n` +
        `Has capturado un **Nivel ${level} ${spawn.shiny ? "✨" : ""}${spawn.name} ${gender}** ` +
        `(${ivPercent}%)\n\n` +
        `💰 Has ganado ${reward} Pokécoins`
    );
};
