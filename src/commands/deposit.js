const { getBalance, deposit } = require('../utils/database');

module.exports = {
  name: 'deposit',
  description: 'Deposita dinero al banco',
  execute: async (message, args, client) => {
    const amount = parseInt(args[0]);

    if (!amount || amount <= 0) {
      return message.reply('Uso: `ch!deposit <cantidad>`');
    }

    const userId = message.author.id;
    const success = deposit(userId, amount);

    if (!success) {
      return message.reply('No tienes suficiente dinero en cartera.');
    }

    return message.reply(`🏦 Depositaste **$${amount.toLocaleString()}** al banco.`);
  }
};