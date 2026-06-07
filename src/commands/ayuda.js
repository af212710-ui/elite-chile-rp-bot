const { EmbedBuilder } = require('discord.js');

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = async (message, args, client) => {
  const isStaff = hasStaffRole(message.member);

  const embed = new EmbedBuilder()
    .setColor('#2C3E50')
    .setTitle('Ayuda - Elite Chile RP')
    .setDescription('Lista de comandos disponibles');

  // Comandos Civiles
  embed.addFields({
    name: '👤 Comandos Civiles',
    value: [
      '`ch!dni crear Nombre, DD/MM/AAAA, Sexo, Nacionalidad`',
      '`ch!dni info` - Ver tu DNI',
      '`ch!dni buscar @usuario` o `ch!dni buscar Nombre`'
    ].join('\n'),
    inline: false
  });

  // Comandos Staff (solo visibles si tienes el rol)
  if (isStaff) {
    embed.addFields({
      name: '🔐 Comandos Staff',
      value: [
        'Actualmente solo comandos civiles disponibles.',
        'Más comandos de staff se agregarán pronto.',
        'El bot ya reconoce tu rol de Staff.'
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

  embed.setFooter({ text: 'Elite Chile RP • Usa los comandos con prefijo ch!' });

  return message.reply({ embeds: [embed] });
};