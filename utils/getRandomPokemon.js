const pokedex = require("../data/pokedex.json");

module.exports = () => {
  const pokemon = pokedex[Math.floor(Math.random() * pokedex.length)];
  return {
    id: pokemon.id,
    name: pokemon.name.english,
    baseStats: {
      hp: pokemon.base.HP,
      attack: pokemon.base.Attack,
      defense: pokemon.base.Defense,
      spAttack: pokemon.base["Sp. Attack"],
      spDefense: pokemon.base["Sp. Defense"],
      speed: pokemon.base.Speed,
    },
  };
};