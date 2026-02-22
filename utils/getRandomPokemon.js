const pokedex = require("../data/pokedex.json");
const rarityList = require("../utils/rarityList");

function getRarity(name) {
  if (rarityList.legendary.includes(name)) return "Legendary";
  if (rarityList.mythical.includes(name)) return "Mythical";
  if (rarityList.ultraBeast.includes(name)) return "Ultra Beast";
  return "Common";
}

module.exports = () => {

  const spawnRates = {
    Common: 91,
    Legendary: 5,
    Mythical: 3,
    "Ultra Beast": 1
  };

  const random = Math.random() * 100;

  let cumulative = 0;
  let selectedRarity;

  for (const rarity in spawnRates) {
    cumulative += spawnRates[rarity];
    if (random <= cumulative) {
      selectedRarity = rarity;
      break;
    }
  }

  const filtered = pokedex.filter(p =>
    getRarity(p.name.english) === selectedRarity
  );

  const pokemon = filtered[Math.floor(Math.random() * filtered.length)];

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