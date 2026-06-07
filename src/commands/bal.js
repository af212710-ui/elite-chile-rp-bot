const { getBalance } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'bal',
  description: 'Muestra tu balance de economía',
  execute: async (message, args, client) => {
    const userId = message.author.id;
    const balance = getBalance(userId);

    const total = balance.cash + balance.bank;

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle(`Economía de ${message.author.username}`)
      .addFields(
        { name: '💵 Cartera (Cash)', value: `$${balance.cash.toLocaleString()}`, inline: true },
        { name: '🏦 Banco', value: `$${balance.bank.toLocaleString()}`, inline: true },
        { name: '💰 Total', value: `$${total.toLocaleString()}`, inline: false }
      )
      .setFooter({ text: 'Elite Chile RP • Economía' });

    return message.reply({ embeds: [embed] });
  }
};