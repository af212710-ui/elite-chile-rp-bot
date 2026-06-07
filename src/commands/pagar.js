const { getBalance, addCash } = require('../utils/database');

module.exports = {
  name: 'pagar',
  description: 'Transfiere dinero a otro usuario',
  execute: async (message, args, client) => {
    const mentioned = message.mentions.users.first();

    if (!mentioned) {
      return message.reply('Uso: `ch!pagar @usuario <cantidad>`');
    }

    if (mentioned.id === message.author.id) {
      return message.reply('No puedes pagarte a ti mismo.');
    }

    const amount = parseInt(args[1]);

    if (!amount || amount <= 0) {
      return message.reply('Debes especificar una cantidad válida.');
    }

    const sender = getBalance(message.author.id);

    if (sender.cash < amount) {
      return message.reply('No tienes suficiente dinero en cartera.');
    }

    // Restar del remitente
    addCash(message.author.id, -amount);

    // Sumar al receptor
    addCash(mentioned.id, amount);

    return message.reply(`💸 Le pagaste **$${amount.toLocaleString()}** a ${mentioned.username}.`);
  }
};