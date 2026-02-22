const mongoose = require("mongoose");

const marketSchema = new mongoose.Schema({
  marketId: Number,
  sellerId: String,
  name: String,
  level: Number,
  gender: String,
  shiny: Boolean,
  image: String,
  ivs: Object,
  ivPercent: Number, // 🔥 ESTA LINEA ES LA CLAVE
  price: Number
}, { timestamps: true });

module.exports = mongoose.model("Market", marketSchema);