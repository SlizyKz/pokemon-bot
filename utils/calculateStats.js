module.exports = (base, ivs, level) => ({
  hp: Math.floor(((2 * base.hp + ivs.hp) * level) / 100 + level + 10),
  attack: Math.floor(((2 * base.attack + ivs.attack) * level) / 100 + 5),
  defense: Math.floor(((2 * base.defense + ivs.defense) * level) / 100 + 5),
  spAttack: Math.floor(((2 * base.spAttack + ivs.spAttack) * level) / 100 + 5),
  spDefense: Math.floor(((2 * base.spDefense + ivs.spDefense) * level) / 100 + 5),
  speed: Math.floor(((2 * base.speed + ivs.speed) * level) / 100 + 5),
});