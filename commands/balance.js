const { EmbedBuilder } = require("discord.js");
const getUserAccount = require("../utils/getUserAccount");

module.exports = async (message) => {

    const account = await getUserAccount(message.author.id);

    const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle("💰 Balance")
        .setDescription(`Tienes **${account.balance} Pokécoins**`)
        .setFooter({ text: message.author.username })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};