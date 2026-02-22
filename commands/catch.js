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

    // 🔥 Eliminamos el spawn
    activeSpawns.delete(message.channel.id);

    // =========================
    // 🔥 GENERAR NUEVO pokemonId
    // =========================

    const lastPokemon = await Pokemon.findOne({
        ownerId: message.author.id,
        pokemonId: { $exists: true }
    }).sort({ pokemonId: -1 });

    const newPokemonId =
        lastPokemon && !isNaN(lastPokemon.pokemonId)
            ? lastPokemon.pokemonId + 1
            : 1;

    // =========================

    const level = spawn.customLevel || (Math.floor(Math.random() * 40) + 1);
    const gender = Math.random() < 0.5 ? "♂" : "♀";

    // =========================
// 🔥 IVs (Admin o Normal)
// =========================

let ivs;
let ivPercent;

if (spawn.customIVs && typeof spawn.customIVs === "object") {

    // 🔥 Usar IVs personalizados del admin
    ivs = spawn.customIVs;

} else {

    // 🔥 IVs aleatorios normales
    ivs = {
        hp: Math.floor(Math.random() * 32),
        attack: Math.floor(Math.random() * 32),
        defense: Math.floor(Math.random() * 32),
        spAttack: Math.floor(Math.random() * 32),
        spDefense: Math.floor(Math.random() * 32),
        speed: Math.floor(Math.random() * 32),
    };
}

const totalIV =
    ivs.hp +
    ivs.attack +
    ivs.defense +
    ivs.spAttack +
    ivs.spDefense +
    ivs.speed;

ivPercent = ((totalIV / 186) * 100).toFixed(2);

    const image = spawn.shiny
        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${spawn.id}.png`
        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${spawn.id}.png`;

    // 🔥 Ahora sí se guarda correctamente
    await Pokemon.create({
        ownerId: message.author.id,
        pokemonId: newPokemonId,
        name: spawn.name,
        level: level,
        gender: gender,
        shiny: spawn.shiny,
        image: image,
        ivs: ivs,
        ivPercent: ivPercent
    });

    const account = await getUserAccount(message.author.id);
    await checkMissionReset(account);

    const reward = spawn.shiny ? 10000 : 100;
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

    message.channel.send(
        `🎉 **¡Felicidades ${message.author}!**\n` +
        `Has capturado un **Nivel ${level} ${spawn.shiny ? "✨" : ""}${spawn.name} ${gender}** ` +
        `(${ivPercent}%)\n\n` +
        `💰 Has ganado ${reward.toLocaleString()} Pokécoins`
    );
};