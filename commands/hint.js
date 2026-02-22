module.exports = async (message, args, activeSpawns) => {

    const spawn = activeSpawns.get(message.channel.id);

    if (!spawn) {
        return message.reply("❌ No hay ningún Pokémon activo.");
    }

    const name = spawn.name;
    const cleanName = name.replace(/ /g, ""); // quitar espacios
    const totalLetters = cleanName.length;

    // 🔥 Revelar la mitad de las letras (redondeado hacia abajo)
    const lettersToReveal = Math.floor(totalLetters / 2);

    let revealedIndexes = new Set();

    // Elegir posiciones aleatorias para revelar
    while (revealedIndexes.size < lettersToReveal) {
        const randomIndex = Math.floor(Math.random() * name.length);
        if (name[randomIndex] !== " ") {
            revealedIndexes.add(randomIndex);
        }
    }

    let hint = "";

    for (let i = 0; i < name.length; i++) {
        if (name[i] === " ") {
            hint += " ";
        } else if (revealedIndexes.has(i)) {
            hint += name[i];
        } else {
            hint += "_";
        }
    }

    message.channel.send(`💡 Pista:\n\`\`\`\n${hint}\n\`\`\``);
};