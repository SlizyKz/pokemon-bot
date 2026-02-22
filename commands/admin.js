const Pokemon = require("../models/Pokemon");
const User = require("../models/User");
const { EmbedBuilder } = require("discord.js");

const OWNER_ID = "836734871422500954";

// 🔥 Función para convertir % IV a stats reales exactos
function generateIVsFromPercent(percent) {

    const totalPoints = Math.floor((percent / 100) * 186);
    const base = Math.floor(totalPoints / 6);

    return {
        hp: base,
        attack: base,
        defense: base,
        spAttack: base,
        spDefense: base,
        speed: totalPoints - (base * 5)
    };
}

module.exports = async (message, args, activeSpawns) => {

    if (message.author.id !== OWNER_ID) {
        return message.reply("❌ No tienes permiso para usar este comando.");
    }

    if (!args[0]) {
        return message.reply("❌ Usa: p!admin resetall | resetmoney | setmoney | spawn");
    }

    const subcommand = args[0].toLowerCase();

    // =====================================
    // 🔥 RESET TODOS LOS POKEMON
    // =====================================
    if (subcommand === "resetall") {

        await Pokemon.deleteMany({});
        return message.channel.send("🔥 Todos los Pokémon fueron eliminados.");
    }

    // =====================================
    // 💰 RESET MONEY
    // =====================================
    if (subcommand === "resetmoney") {

        if (args[1] === "all") {
            await User.updateMany({}, { balance: 0 });
            return message.channel.send("💥 Todo el dinero fue reseteado.");
        }

        const user = message.mentions.users.first();
        if (!user)
            return message.reply("❌ Menciona un usuario o usa: p!admin resetmoney all");

        await User.updateOne({ userId: user.id }, { balance: 0 });

        return message.channel.send(`💸 El dinero de ${user} fue reseteado.`);
    }

    // =====================================
    // 💰 SET MONEY
    // =====================================
    if (subcommand === "setmoney") {

        const user = message.mentions.users.first();
        const amount = parseInt(args[2]);

        if (!user) return message.reply("❌ Menciona un usuario.");
        if (isNaN(amount) || amount < 0)
            return message.reply("❌ Cantidad inválida.");

        await User.updateOne(
            { userId: user.id },
            { balance: amount },
            { upsert: true }
        );

        return message.channel.send(
            `💰 El dinero de ${user} ahora es ${amount.toLocaleString()} Pokécoins.`
        );
    }

    // =====================================
    // 🛠 SPAWN PERSONALIZADO
    // =====================================
    if (subcommand === "spawn") {

        if (!args[1])
            return message.reply("❌ Usa: p!admin spawn shiny(opcional) <pokemon> <iv%> <nivel>");

        let isShiny = false;
        let index = 1;

        if (args[1].toLowerCase() === "shiny") {
            isShiny = true;
            index++;
        }

        const name = args[index]?.toLowerCase();
        const ivPercent = parseInt(args[index + 1]);
        const levelInput = parseInt(args[index + 2]);

        if (!name || isNaN(ivPercent) || isNaN(levelInput))
            return message.reply("❌ Usa: p!admin spawn shiny(opcional) <pokemon> <iv%> <nivel>");

        if (ivPercent < 1 || ivPercent > 100)
            return message.reply("❌ IV debe estar entre 1 y 100.");

        if (levelInput < 1 || levelInput > 100)
            return message.reply("❌ Nivel debe estar entre 1 y 100.");

        // 🔥 Obtener ID real desde PokéAPI
        let response;
        try {
            response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
        } catch {
            return message.reply("❌ Error al conectar con PokéAPI.");
        }

        if (!response.ok)
            return message.reply("❌ Pokémon no encontrado.");

        const data = await response.json();

        // 🔥 Generar IVs exactos
        const ivs = generateIVsFromPercent(ivPercent);

        // 🔥 Sobrescribe cualquier spawn activo
        activeSpawns.set(message.channel.id, {
            id: data.id, // 🔥 ID REAL NUMÉRICO
            name: data.name,
            shiny: isShiny,
            customIVs: ivs,
            customLevel: levelInput,
            revealedLetters: [],
            spawnId: Date.now() + Math.random()
        });

        const image = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${isShiny ? "shiny/" : ""}${data.id}.png`;

        const embed = new EmbedBuilder()
            .setTitle(isShiny ? "✨ ¡Un Pokémon Shiny apareció!" : "🌿 ¡Un Pokémon salvaje apareció!")
            .setDescription("Escribe `p!catch <nombre>` para atraparlo.")
            .setImage(image)
            .setColor(isShiny ? 0xffd700 : 0x2ecc71)
            .setFooter({ text: "Spawn generado por administrador." })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    // =====================================
    // ❌ SUBCOMANDO INVALIDO
    // =====================================
    return message.reply("❌ Subcomando inválido.");
};