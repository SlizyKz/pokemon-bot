const Pokemon = require("../models/Pokemon");
const getUserAccount = require("../utils/getUserAccount");
const checkMissionReset = require("../utils/checkMissionReset");
const isRare = require("../utils/isRare");

module.exports = async (message, args, activeSpawns) => {

    const spawn = activeSpawns.get(message.channel.id);

    if (!spawn) {
        return message.reply("❌ No hay ningún Pokémon para capturar.");
    }

    const guess = args.join(" ").toLowerCase();

    if (guess !== spawn.name.toLowerCase()) {
        return message.reply("❌ Ese no es el Pokémon correcto.");
    }

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

    // 🔄 Reset automático si corresponde
    await checkMissionReset(account);

    // 💰 Recompensa base
    const reward = spawn.shiny ? 500 : 50;
    account.balance += reward;

    // ================================
    // 🎯 SISTEMA DE MISIONES ARREGLADO
    // ================================

    if (account.missions && account.missions.length > 0) {

        for (let mission of account.missions) {

            // 🔒 Si ya está completada NO se puede volver a completar
            if (mission.completed) continue;

            let progressAdded = false;

            // ✅ Catch normal
            if (mission.type === "catch") {
                mission.progress += 1;
                progressAdded = true;
            }

            // ✅ Rare
            if (mission.type === "rare" && isRare(spawn.name)) {
                mission.progress += 1;
                progressAdded = true;
            }

            // ✅ Shiny
            if (mission.type === "shiny" && spawn.shiny) {
                mission.progress += 1;
                progressAdded = true;
            }

            // 🔒 Evita que sobrepase el target
            if (mission.progress > mission.target) {
                mission.progress = mission.target;
            }

            // 🎉 Completar misión SOLO si llegó exactamente al objetivo
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

    activeSpawns.delete(message.channel.id);

    message.channel.send(
        `🎉 **¡Felicidades ${message.author}!**\n` +
        `Has capturado un **Nivel ${level} ${spawn.shiny ? "✨" : ""}${spawn.name} ${gender}** ` +
        `(${ivPercent}%)\n\n` +
        `💰 Has ganado ${reward} Pokécoins`
    );
};
