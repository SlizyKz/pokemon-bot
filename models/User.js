const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({

    userId: {
        type: String,
        required: true,
        unique: true
    },

    balance: {
        type: Number,
        default: 0
    },

    missions: {
        type: Array,
        default: []
    },

    lastMissionReset: {
        type: Date,
        default: null
    },

    selectedPokemon: {
  type: String,
  default: null
}
});

module.exports = mongoose.model("User", userSchema);
