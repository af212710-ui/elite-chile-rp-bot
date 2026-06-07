const { EmbedBuilder } = require('discord.js');

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = {
  name: 'ayuda',
  description: 'Muestra la lista de comandos',
  execute: async (message, args, client) => {
    const isStaff = hasStaffRole(message.member);

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle('📋 Ayuda - Elite Chile RP')
      .setDescription('Comandos disponibles del bot');

    embed.addFields({
      name: '👤 Comandos Civiles',
      value: [
        '`ch!creadni Nombre, DD/MM/AAAA, Sexo, Nacionalidad`',
        '`ch!verdni` - Ver tu DNI',
        '`ch!verdni @usuario` - Ver DNI de otra persona (solo staff)'
      ].join('\n'),
      inline: false
    });

    if (isStaff) {
      embed.addFields({
        name: '🔐 Comandos Staff',
        value: [
          '`ch!buscar Nombre` - Buscar DNI por nombre',
          '`ch!eliminardni @usuario` - Eliminar DNI',
          '`ch!verdni @usuario` - Ver DNI de cualquier persona'
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