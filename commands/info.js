const {
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const Pokemon = require("../models/Pokemon");
const User = require("../models/User");

module.exports = async (message, args) => {

    const pokemons = await Pokemon
        .find({ ownerId: message.author.id })
        .sort({ _id: 1 });

    if (pokemons.length === 0) {
        return message.reply("❌ No tienes Pokémon capturados.");
    }

    const user = await User.findOne({ userId: message.author.id });

    let index;

    // 🔥 p!info latest
    if (args[0] && args[0].toLowerCase() === "latest") {
        index = pokemons.length - 1;
    }

    // 🔥 p!info número
    else if (args[0]) {
        const number = parseInt(args[0]);

        if (isNaN(number) || number <= 0 || number > pokemons.length) {
            return message.reply("❌ Número inválido.");
        }

        index = number - 1;
    }

    // 🔥 p!info sin argumentos → mostrar seleccionado
    else {

        if (!user || !user.selectedPokemon) {
            return message.reply("❌ No tienes ningún Pokémon seleccionado. Usa p!select <id>");
        }

        const selectedIndex = pokemons.findIndex(
            p => p._id.toString() === user.selectedPokemon
        );

        if (selectedIndex === -1) {
            return message.reply("❌ Tu Pokémon seleccionado ya no existe.");
        }

        index = selectedIndex;
    }

    const generateEmbed = (p, number) => {

        const ivs = p.ivs || {
            hp: 0,
            attack: 0,
            defense: 0,
            spAttack: 0,
            spDefense: 0,
            speed: 0
        };

        const isSelected = user?.selectedPokemon === p._id.toString();

        return new EmbedBuilder()
            .setColor(p.shiny ? 0xFFD700 : 0x3498db)
            .setTitle(`${p.shiny ? "✨" : ""}${p.name} ${p.gender || ""}`)
            .setDescription(
                `Nivel ${p.level}` +
                (isSelected ? "\n\n⭐ **Pokémon Seleccionado**" : "")
            )
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
            .setFooter({ text: `Pokémon #${number} de ${pokemons.length}` })
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
        embeds: [generateEmbed(pokemons[index], index + 1)],
        components: [row]
    });

    const collector = msg.createMessageComponentCollector({
        time: 60000
    });

    collector.on("collect", async interaction => {

        if (interaction.user.id !== message.author.id) {
            return interaction.reply({
                content: "❌ Solo quien ejecutó el comando puede usar estos botones.",
                ephemeral: true
            });
        }

        if (interaction.customId === "prev") {
            index = index > 0 ? index - 1 : pokemons.length - 1;
        }

        if (interaction.customId === "next") {
            index = index < pokemons.length - 1 ? index + 1 : 0;
        }

        await interaction.update({
            embeds: [generateEmbed(pokemons[index], index + 1)],
            components: [row]
        });
    });

    collector.on("end", async () => {

        const disabledRow = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("prev")
                .setLabel("⬅️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true),
            new ButtonBuilder()
                .setCustomId("next")
                .setLabel("➡️")
                .setStyle(ButtonStyle.Primary)
                .setDisabled(true)
        );

        msg.edit({ components: [disabledRow] }).catch(() => {});
    });
};