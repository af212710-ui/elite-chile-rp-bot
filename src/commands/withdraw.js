const { getBalance, withdraw } = require('../utils/database');

module.exports = {
  name: 'withdraw',
  description: 'Retira dinero del banco',
  execute: async (message, args, client) => {
    const amount = parseInt(args[0]);

    if (!amount || amount <= 0) {
      return message.reply('Uso: `ch!withdraw <cantidad>`');
    }

    const userId = message.author.id;
    const success = withdraw(userId, amount);

    if (!success) {
      return message.reply('No tienes suficiente dinero en el banco.');
    }

    return message.reply(`💵 Retiraste **$${amount.toLocaleString()}** a tu cartera.`);
  }
};