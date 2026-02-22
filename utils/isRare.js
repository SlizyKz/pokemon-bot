const rarity = require("./rarityList");

module.exports = (name) => {

  const formatted = name.toLowerCase();

  return (
    rarity.legendary.map(p => p.toLowerCase()).includes(formatted) ||
    rarity.mythical.map(p => p.toLowerCase()).includes(formatted) ||
    rarity.ultraBeast.map(p => p.toLowerCase()).includes(formatted)
  );
};
