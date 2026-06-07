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
        '`ch!bal` - Ver tu dinero',
        '`ch!collect` - Recoger sueldo',
        '`ch!deposit <cantidad>` - Depositar al banco',
        '`ch!withdraw <cantidad>` - Retirar del banco',
        '`ch!pagar @usuario <cantidad>` - Pagar a alguien',
        '`ch!leaderboard` - Top 10 más ricos',
        '`ch!ia Tu mensaje` - Hablar con la IA'
      ].join('\n'),
      inline: false
    });

    if (staff) {
      embed.addFields({
        name: '🔐 Comandos Staff',
        value: [
          '`ch!buscar Nombre`',
          '`ch!eliminardni @usuario`',
          '`ch!msg Tu mensaje`'
        ].join('\n'),
        inline: false
      });
    }

    embed.setFooter({ text: 'Elite Chile RP • Prefijo ch!' });
    return message.reply({ embeds: [embed] });
  }
};