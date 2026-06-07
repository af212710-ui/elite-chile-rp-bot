const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = {
  name: 'msg',
  description: 'El bot envía un mensaje y borra el tuyo (solo staff)',
  execute: async (message, args, client) => {
    if (!hasStaffRole(message.member)) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    if (args.length === 0) {
      return message.reply('Uso: `ch!msg Tu mensaje aquí`');
    }

    const text = args.join(' ');

    try {
      // Borrar el mensaje original del usuario
      await message.delete();

      // Enviar el mensaje como si fuera el bot
      await message.channel.send(text);
    } catch (error) {
      console.error('Error en ch!msg:', error);
      // Si no se puede borrar, al menos enviar el mensaje
      try {
        await message.channel.send(text);
      } catch (e) {}
    }
  }
};