const mongoose = require("mongoose");

const pokemonSchema = new mongoose.Schema({
  ownerId: String,
  name: String,
  level: Number,
  gender: String,
  shiny: Boolean,
  image: String,
  ivs: Object,
  stats: Object,
  ivPercent: Number
});

module.exports = mongoose.model("Pokemon", pokemonSchema);