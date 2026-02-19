const Pokemon = require("../models/Pokemon");
const User = require("../models/User");

const OWNER_ID = "836734871422500954";

module.exports = async (message, args) => {

    if (message.author.id !== OWNER_ID) {
        return message.reply("❌ No tienes permiso para usar este comando.");
    }

    if (!args[0]) {
        return message.reply("❌ Usa: p!admin resetall | resetmoney | setmoney");
    }

    const subcommand = args[0].toLowerCase();

    // 🔥 RESET TODOS LOS POKEMON
    if (subcommand === "resetall") {

        await Pokemon.deleteMany({});

        return message.channel.send(
            "🔥 Todos los Pokémon fueron eliminados de la base de datos."
        );
    }

    // 💰 RESET MONEY
    if (subcommand === "resetmoney") {

        if (args[1] === "all") {

            await User.updateMany({}, { balance: 0 });

            return message.channel.send("💥 Todo el dinero fue reseteado.");
        }

        const user = message.mentions.users.first();
        if (!user) {
            return message.reply("❌ Menciona un usuario o usa: p!admin resetmoney all");
        }

        await User.updateOne(
            { userId: user.id },
            { balance: 0 }
        );

        return message.channel.send(
            `💸 El dinero de ${user} fue reseteado.`
        );
    }

    // 💰 SET MONEY
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

    message.reply("❌ Subcomando inválido.");
};
