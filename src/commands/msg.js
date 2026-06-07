const { isStaff } = require('../utils/permissions');

module.exports = {
  name: 'msg',
  description: 'El bot envía un mensaje y borra el tuyo (solo staff)',
  execute: async (message, args, client) => {
    if (!isStaff(message.member)) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    if (args.length === 0) {
      return message.reply('Uso: `ch!msg Tu mensaje aquí`');
    }

    const text = args.join(' ');

    try {
      await message.delete();
      await message.channel.send(text);
    } catch (error) {
      console.error('Error en ch!msg:', error);
      try {
        await message.channel.send(text);
      } catch (e) {}
    }
  }
};