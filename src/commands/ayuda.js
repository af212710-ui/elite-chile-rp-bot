const { EmbedBuilder } = require('discord.js');
const { isStaff } = require('../utils/permissions');

module.exports = {
  name: 'ayuda',
  description: 'Muestra la lista de comandos',
  execute: async (message, args, client) => {
    const staff = isStaff(message.member);

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle('📋 Ayuda - Elite Chile RP')
      .setDescription('Comandos disponibles del bot');

    embed.addFields({
      name: '👤 Comandos Civiles',
      value: [
        '`ch!creadni Nombre, DD/MM/AAAA, Sexo, Nacionalidad`',
        '`ch!verdni` - Ver tu DNI',
        '`ch!verdni @usuario` - Ver DNI de otra persona (solo staff)',
        '`ch!ia Tu mensaje` - Hablar con la IA'
      ].join('\n'),
      inline: false
    });

    if (staff) {
      embed.addFields({
        name: '🔐 Comandos Staff',
        value: [
          '`ch!buscar Nombre` - Buscar DNI por nombre',
          '`ch!eliminardni @usuario` - Eliminar DNI',
          '`ch!msg Tu mensaje` - El bot dice el mensaje (borra el tuyo)',
          '`ch!ia Tu mensaje` - Usar la IA (sin rate limit)'
        ].join('\n'),
        inline: false
      });
    } else {
      embed.addFields({
        name: '🔐 Comandos Staff',
        value: 'Solo visibles para miembros del staff.',
        inline: false
      });
    }

    embed.setFooter({ text: 'Elite Chile RP • Prefijo ch!' });
    return message.reply({ embeds: [embed] });
  }
};