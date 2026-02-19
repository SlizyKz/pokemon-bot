module.exports = async (message, activeSpawns) => {

  const spawn = activeSpawns.get(message.channel.id);

  if (!spawn) {
    return message.reply("❌ No hay ningún Pokémon salvaje en este canal.");
  }

  const name = spawn.name;
  const cleanName = name.replace(/[^a-zA-Z]/g, "");
  const length = cleanName.length;

  let revealCount;

  if (length <= 6) {
    revealCount = 3;
  } else {
    revealCount = 4;
  }

  // Siempre mostrar primera y última letra
  let revealedIndexes = [0, length - 1];

  // Calcular posiciones del medio
  const middleIndexes = [];

  for (let i = 1; i < length - 1; i++) {
    middleIndexes.push(i);
  }

  // Mezclar posiciones del medio
  middleIndexes.sort(() => 0.5 - Math.random());

  // Agregar letras necesarias hasta completar revealCount
  while (revealedIndexes.length < revealCount && middleIndexes.length > 0) {
    revealedIndexes.push(middleIndexes.shift());
  }

  // Construir hint
  let result = "";

  for (let i = 0; i < length; i++) {
    if (revealedIndexes.includes(i)) {
      result += cleanName[i];
    } else {
      result += "_";
    }
  }

  message.channel.send(`💡 Pista:\n\`${result}\``);
};
