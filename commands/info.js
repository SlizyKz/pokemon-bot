const { EmbedBuilder } = require("discord.js");
const Pokemon = require("../models/Pokemon");

module.exports = async (message, args) => {

    if (!args[0]) {
        return message.reply("❌ Usa: p!info <número>");
    }

    const number = parseInt(args[0]);

    if (isNaN(number) || number <= 0) {
        return message.reply("❌ Número inválido.");
    }

    const pokemons = await Pokemon
        .find({ ownerId: message.author.id })
        .sort({ _id: 1 });

    if (number > pokemons.length) {
        return message.reply("❌ Pokémon no encontrado.");
    }

    const p = pokemons[number - 1];

    // 🔥 Protección por si no tiene IVs
    const ivs = p.ivs || {
        hp: 0,
        attack: 0,
        defense: 0,
        spAttack: 0,
        spDefense: 0,
        speed: 0
    };

    const embed = new EmbedBuilder()
        .setColor(p.shiny ? 0xFFD700 : 0x3498db)
        .setTitle(`${p.shiny ? "✨" : ""}${p.name} ${p.gender || ""}`)
        .setDescription(`Nivel ${p.level}`)
        .setImage(p.image || null)
        .addFields(
            { name: "📊 IV Total", value: `${p.ivPercent || 0}%`, inline: true },
            { name: "❤️ HP", value: `${ivs.hp}/31`, inline: true },
            { name: "⚔️ Ataque", value: `${ivs.attack}/31`, inline: true },
            { name: "🛡 Defensa", value: `${ivs.defense}/31`, inline: true },
            { name: "✨ Atq. Esp.", value: `${ivs.spAttack}/31`, inline: true },
            { name: "🔰 Def. Esp.", value: `${ivs.spDefense}/31`, inline: true },
            { name: "💨 Velocidad", value: `${ivs.speed}/31`, inline: true }
        )
        .setFooter({ text: `Pokémon #${number}` })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};
