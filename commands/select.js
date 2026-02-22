const Pokemon = require("../models/Pokemon");
const User = require("../models/User");

module.exports = async (message, args) => {

  const number = parseInt(args[0]);

  if (!number)
    return message.reply("❌ Usa: p!select <número>");

  const pokemon = await Pokemon.findOne({
    ownerId: message.author.id,
    pokemonId: number
  });

  if (!pokemon)
    return message.reply("❌ No tienes un Pokémon con ese número.");

  const user = await User.findOne({ userId: message.author.id });

  user.selectedPokemon = pokemon._id;
  await user.save();

  message.reply(`✅ Has seleccionado a ${pokemon.name}`);
};