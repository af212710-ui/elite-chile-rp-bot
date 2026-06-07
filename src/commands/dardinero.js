const { addCash, addBank } = require('../utils/database');
const { isStaff } = require('../utils/permissions');

module.exports = {
  name: 'dardinero',
  description: 'Dar dinero a un usuario (solo staff)',
  execute: async (message, args, client) => {
    if (!isStaff(message.member)) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const mentioned = message.mentions.users.first();
    if (!mentioned) {
      return message.reply('Uso: `ch!dardinero @usuario <monto> <cartera/banco>`');
    }

    const amount = parseInt(args[1]);
    if (!amount || amount <= 0) {
      return message.reply('Debes especificar una cantidad válida mayor a 0.');
    }

    const destino = (args[2] || '').toLowerCase();
    if (!['cartera', 'banco'].includes(destino)) {
      return message.reply('Debes especificar `cartera` o `banco`.');
    }

    if (destino === 'cartera') {
      addCash(mentioned.id, amount);
    } else {
      addBank(mentioned.id, amount);
    }

    return message.reply(
      `💸 Le diste **$${amount.toLocaleString()}** a ${mentioned.username} en **${destino}**.`
    );
  }
};