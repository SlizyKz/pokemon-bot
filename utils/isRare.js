const rarity = require("./rarityList");

module.exports = (name) => {
  return (
    rarity.legendary.includes(name) ||
    rarity.mythical.includes(name) ||
    rarity.ultraBeast.includes(name)
  );
};
