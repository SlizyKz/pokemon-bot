const getUserAccount = require("../utils/getUserAccount");

module.exports = async (message, args) => {

    const user = message.mentions.users.first();
    const amount = parseInt(args[1]);

    if (!user) return message.reply("❌ Menciona un usuario.");
    if (!amount || amount <= 0) return message.reply("❌ Cantidad inválida.");

    const sender = await getUserAccount(message.author.id);
    const receiver = await getUserAccount(user.id);

    if (sender.balance < amount) {
        return message.reply("❌ No tienes suficiente dinero.");
    }

    sender.balance -= amount;
    receiver.balance += amount;

    await sender.save();
    await receiver.save();

    message.channel.send(
        `💸 ${message.author} le dio **${amount} Pokécoins** a ${user}`
    );
};