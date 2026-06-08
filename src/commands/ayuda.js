const { EmbedBuilder } = require('discord.js');
const { isStaff } = require('../utils/permissions');
const colors = require('../config/colors');

module.exports = {
  name: 'ayuda',
  description: 'Muestra la lista de comandos',
  execute: async (message, args, client) => {
    const staff = isStaff(message.member);

    const embed = new EmbedBuilder()
      .setColor(colors.primary)
      .setTitle('📋 Ayuda - Elite Chile RP')
      .setDescription('Prefijo: `ch!` | Sueldos: **Semanal**');

    embed.addFields({
      name: '👤 Comandos Civiles',
      value: [
        '`ch!creadni <nombre>, <DD/MM/AAAA>, <sexo>, <nacionalidad>` - Crear DNI',
        '`ch!verdni` - Ver tu DNI',
        '`ch!verdni @usuario` - Ver DNI de otro (solo staff)',
        '`ch!bal` - Ver tu dinero (cartera + banco)',
        '`ch!collect` - Reclamar sueldo **semanal**',
        '`ch!deposit <cantidad>` - Depositar al banco',
        '`ch!withdraw <cantidad>` - Retirar del banco',
        '`ch!pagar @usuario <cantidad>` - Transferir dinero',
        '`ch!leaderboard` - Top 10 más ricos',
        '`ch!ia <mensaje>` - Hablar con la IA'
      ].join('\n'),
      inline: false
    });

    if (staff) {
      embed.addFields({
        name: '🔐 Comandos Staff',
        value: [
          '`ch!buscar <nombre>` - Buscar DNI',
          '`ch!eliminardni @usuario` - Eliminar DNI',
          '`ch!msg <texto>` - Enviar mensaje como bot',
          '`ch!dardinero @usuario <monto> <cartera/banco>` - Dar dinero',
          '`ch!quitardinero @usuario <monto> <cartera/banco>` - Quitar dinero'
        ].join('\n'),
        inline: false
      });
    }

    embed.setFooter({ text: 'Elite Chile RP • Sueldos semanales' });
    return message.reply({ embeds: [embed] });
  }
};