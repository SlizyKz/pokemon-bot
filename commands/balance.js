const { EmbedBuilder } = require("discord.js");
const getUserAccount = require("../utils/getUserAccount");

module.exports = async (message) => {

    const account = await getUserAccount(message.author.id);

    // 🔥 Formatear dinero correctamente
    const formattedBalance = Intl.NumberFormat("en-US")
        .format(Number(account.balance || 0));

    const embed = new EmbedBuilder()
        .setColor(0xF1C40F)
        .setTitle("💰 Balance")
        .setDescription(`Tienes **${formattedBalance} Pokécoins**`)
        .setFooter({ text: message.author.username })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
};