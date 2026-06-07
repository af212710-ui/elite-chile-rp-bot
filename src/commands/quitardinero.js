const { getBalance, updateBalance } = require('../utils/database');
const { isStaff } = require('../utils/permissions');

module.exports = {
  name: 'quitardinero',
  description: 'Quitar dinero a un usuario (solo staff)',
  execute: async (message, args, client) => {
    if (!isStaff(message.member)) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const mentioned = message.mentions.users.first();
    if (!mentioned) {
      return message.reply('Uso: `ch!quitardinero @usuario <monto> <cartera/banco>`');
    }

    const amount = parseInt(args[1]);
    if (!amount || amount <= 0) {
      return message.reply('Debes especificar una cantidad válida mayor a 0.');
    }

    const destino = (args[2] || '').toLowerCase();
    if (!['cartera', 'banco'].includes(destino)) {
      return message.reply('Debes especificar `cartera` o `banco`.');
    }

    const userBalance = getBalance(mentioned.id);

    if (destino === 'cartera') {
      if (userBalance.cash < amount) {
        return message.reply(`El usuario no tiene suficiente dinero en cartera. Tiene $${userBalance.cash.toLocaleString()}.`);
      }
      updateBalance(mentioned.id, userBalance.cash - amount, userBalance.bank);
    } else {
      if (userBalance.bank < amount) {
        return message.reply(`El usuario no tiene suficiente dinero en el banco. Tiene $${userBalance.bank.toLocaleString()}.`);
      }
      updateBalance(mentioned.id, userBalance.cash, userBalance.bank - amount);
    }

    return message.reply(
      `🔒 Le quitaste **$${amount.toLocaleString()}** a ${mentioned.username} de **${destino}**.`
    );
  }
};