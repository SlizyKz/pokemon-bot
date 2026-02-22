const Market = require("../models/Market");
const Pokemon = require("../models/Pokemon");
const User = require("../models/User");

const {
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle
} = require("discord.js");

// 🔥 Formateador de dinero
const formatMoney = (amount) =>
  Intl.NumberFormat("en-US").format(Number(amount || 0));

module.exports = async (message, args) => {

  const sub = args[0];

  // ==============================
  // 📜 VER MERCADO
  // ==============================
  if (!sub) {

    const listings = await Market.find().sort({ createdAt: -1 });

    if (listings.length === 0)
      return message.reply("🛒 El mercado está vacío.");

    const itemsPerPage = 5;
    let currentPage = 0;
    const totalPages = Math.ceil(listings.length / itemsPerPage);

    const generateEmbed = (page) => {
      const start = page * itemsPerPage;
      const end = start + itemsPerPage;
      const current = listings.slice(start, end);

      const desc = current.map(l => {
        const iv = l.ivPercent ? Number(l.ivPercent).toFixed(2) : "0.00";
        return (
          `**ID:** ${l.marketId}\n` +
          `${l.shiny ? "✨" : ""}**${l.name}** ${l.gender || ""} Lv.${l.level}\n` +
          `IV: ${iv}%\n` +
          `💰 Precio: ${formatMoney(l.price)}\n`
        );
      }).join("\n");

      return new EmbedBuilder()
        .setTitle("🛒 Mercado Pokémon")
        .setDescription(desc)
        .setFooter({ text: `Página ${page + 1} de ${totalPages}` })
        .setColor(0x2ecc71)
        .setTimestamp();
    };

    const row = () => new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("prev")
        .setLabel("⬅")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === 0),
      new ButtonBuilder()
        .setCustomId("next")
        .setLabel("➡")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(currentPage === totalPages - 1)
    );

    const msg = await message.channel.send({
      embeds: [generateEmbed(currentPage)],
      components: [row()]
    });

    const collector = msg.createMessageComponentCollector({ time: 120000 });

    collector.on("collect", async interaction => {

      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "❌ No puedes usar estos botones.", ephemeral: true });

      if (interaction.customId === "prev") currentPage--;
      if (interaction.customId === "next") currentPage++;

      await interaction.update({
        embeds: [generateEmbed(currentPage)],
        components: [row()]
      });
    });

    collector.on("end", async () => {
      await msg.edit({ components: [] }).catch(() => {});
    });

    return;
  }

  // ==============================
  // 💸 SELL
  // ==============================
  if (sub === "sell") {

    const id = parseInt(args[1]);
    const price = parseInt(args[2]);

    if (!id || !price)
      return message.reply("Usa: p!market sell <id> <precio>");

    const pokemons = await Pokemon.find({
      ownerId: message.author.id
    }).sort({ pokemonId: 1 });

    const pokemon = pokemons[id - 1];

    if (!pokemon)
      return message.reply("❌ No tienes ese Pokémon.");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_sell")
        .setLabel("✅ Confirmar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_sell")
        .setLabel("❌ Cancelar")
        .setStyle(ButtonStyle.Danger)
    );

    const confirmMsg = await message.reply({
      embeds: [{
        title: "⚠ Confirmar Venta",
        description:
          `Vas a vender ${pokemon.shiny ? "✨" : ""}${pokemon.name} (Lv.${pokemon.level})\n` +
          `IV: ${Number(pokemon.ivPercent).toFixed(2)}%\n` +
          `Precio: 💰 ${formatMoney(price)}`,
        color: 0xf1c40f
      }],
      components: [row]
    });

    const collector = confirmMsg.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async interaction => {

      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "❌ No puedes usar esto.", ephemeral: true });

      if (interaction.customId === "cancel_sell") {
        collector.stop();
        return interaction.update({ content: "❌ Venta cancelada.", embeds: [], components: [] });
      }

      if (interaction.customId === "confirm_sell") {

        const last = await Market.findOne().sort({ marketId: -1 });
        const newId = last ? last.marketId + 1 : 1;

        await Market.create({
          marketId: newId,
          sellerId: message.author.id,
          name: pokemon.name,
          level: pokemon.level,
          gender: pokemon.gender,
          shiny: pokemon.shiny,
          image: pokemon.image,
          ivs: pokemon.ivs,
          ivPercent: pokemon.ivPercent,
          price
        });

        await Pokemon.deleteOne({ _id: pokemon._id });

        collector.stop();

        return interaction.update({
          embeds: [{
            title: "✅ Pokémon puesto en venta",
            description: `${pokemon.name} ahora cuesta 💰 ${formatMoney(price)}`,
            color: 0x2ecc71
          }],
          components: []
        });
      }
    });

    return;
  }

  // ==============================
  // ❌ REMOVE
  // ==============================
  if (sub === "remove") {

    const marketId = parseInt(args[1]);

    if (!marketId)
      return message.reply("Usa: p!market remove <marketId>");

    const listing = await Market.findOne({ marketId });

    if (!listing)
      return message.reply("❌ Ese Pokémon no existe.");

    if (listing.sellerId !== message.author.id)
      return message.reply("❌ Ese Pokémon no te pertenece.");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_remove")
        .setLabel("✅ Confirmar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_remove")
        .setLabel("❌ Cancelar")
        .setStyle(ButtonStyle.Danger)
    );

    const confirmMsg = await message.reply({
      embeds: [{
        title: "⚠ Confirmar Retiro",
        description:
          `${listing.shiny ? "✨" : ""}${listing.name} (Lv.${listing.level})\n` +
          `IV: ${Number(listing.ivPercent).toFixed(2)}%\n\n¿Deseas retirarlo del mercado?`,
        color: 0xf1c40f
      }],
      components: [row]
    });

    const collector = confirmMsg.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async interaction => {

      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "❌ No puedes usar esto.", ephemeral: true });

      if (interaction.customId === "cancel_remove") {
        collector.stop();
        return interaction.update({ content: "❌ Operación cancelada.", embeds: [], components: [] });
      }

      if (interaction.customId === "confirm_remove") {

        const lastPokemon = await Pokemon.findOne({
          ownerId: message.author.id,
          pokemonId: { $exists: true }
        }).sort({ pokemonId: -1 });

        const newPokemonId =
          lastPokemon && !isNaN(lastPokemon.pokemonId)
            ? lastPokemon.pokemonId + 1
            : 1;

        await Pokemon.create({
          ownerId: message.author.id,
          pokemonId: newPokemonId,
          name: listing.name,
          level: listing.level,
          gender: listing.gender,
          shiny: listing.shiny,
          image: listing.image,
          ivs: listing.ivs,
          ivPercent: listing.ivPercent
        });

        await Market.deleteOne({ marketId });

        collector.stop();

        return interaction.update({
          embeds: [{
            title: "📦 Pokémon removido",
            description: `${listing.name} ha sido devuelto a tu equipo.`,
            color: 0x2ecc71
          }],
          components: []
        });
      }
    });

    return;
  }

  // ==============================
  // 🛍 BUY
  // ==============================
  if (sub === "buy") {

    const marketId = parseInt(args[1]);

    if (!marketId)
      return message.reply("Usa: p!market buy <id>");

    const listing = await Market.findOne({ marketId });

    if (!listing)
      return message.reply("❌ Ese Pokémon no existe.");

    if (listing.sellerId === message.author.id)
      return message.reply("❌ No puedes comprar tu propio Pokémon.");

    const buyer = await User.findOne({ userId: message.author.id });
    const seller = await User.findOne({ userId: listing.sellerId });

    if (!buyer || buyer.balance < listing.price)
      return message.reply("❌ No tienes suficiente dinero.");

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId("confirm_buy")
        .setLabel("✅ Confirmar")
        .setStyle(ButtonStyle.Success),
      new ButtonBuilder()
        .setCustomId("cancel_buy")
        .setLabel("❌ Cancelar")
        .setStyle(ButtonStyle.Danger)
    );

    const confirmMsg = await message.reply({
      embeds: [{
        title: "⚠ Confirmar Compra",
        description:
          `${listing.name} (Lv.${listing.level})\n` +
          `IV: ${Number(listing.ivPercent).toFixed(2)}%\n` +
          `Precio: 💰 ${formatMoney(listing.price)}`,
        color: 0xf1c40f
      }],
      components: [row]
    });

    const collector = confirmMsg.createMessageComponentCollector({ time: 30000 });

    collector.on("collect", async interaction => {

      if (interaction.user.id !== message.author.id)
        return interaction.reply({ content: "❌ No puedes usar esto.", ephemeral: true });

      if (interaction.customId === "cancel_buy") {
        collector.stop();
        return interaction.update({ content: "❌ Compra cancelada.", embeds: [], components: [] });
      }

      if (interaction.customId === "confirm_buy") {

        buyer.balance -= listing.price;
        seller.balance += listing.price;

        await buyer.save();
        await seller.save();

        const lastPokemon = await Pokemon.findOne({
          ownerId: message.author.id,
          pokemonId: { $exists: true }
        }).sort({ pokemonId: -1 });

        const newPokemonId =
          lastPokemon && !isNaN(lastPokemon.pokemonId)
            ? lastPokemon.pokemonId + 1
            : 1;

        await Pokemon.create({
          ownerId: message.author.id,
          pokemonId: newPokemonId,
          name: listing.name,
          level: listing.level,
          gender: listing.gender,
          shiny: listing.shiny,
          image: listing.image,
          ivs: listing.ivs,
          ivPercent: listing.ivPercent
        });

        await Market.deleteOne({ marketId });

        collector.stop();

        return interaction.update({
          embeds: [{
            title: "🛍 Compra completada",
            description: `Ahora ${listing.name} es tuyo.`,
            color: 0x2ecc71
          }],
          components: []
        });
      }
    });

    return;
  }
};