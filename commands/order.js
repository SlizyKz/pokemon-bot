const User = require("../models/User");

module.exports = async (message, args) => {

    const option = args[0]?.toLowerCase();

    const validOptions = ["id", "iv", "level", "newest", "oldest"];

    if (!validOptions.includes(option)) {
        return message.reply(
            "❌ Usa: p!order id | iv | level | newest | oldest"
        );
    }

    await User.updateOne(
        { userId: message.author.id },
        { orderPreference: option },
        { upsert: true }
    );

    message.reply(`✅ Ahora tus Pokémon se ordenarán por **${option}**.`);
};