const { searchDNIsByName } = require('../utils/database');
const { EmbedBuilder } = require('discord.js');
const { isStaff } = require('../utils/permissions');

module.exports = {
  name: 'buscar',
  description: 'Buscar DNI por nombre (solo staff)',
  execute: async (message, args, client) => {
    if (!isStaff(message.member)) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const term = args.join(' ').toLowerCase();
    if (!term) {
      return message.reply('Uso: `ch!buscar Nombre`');
    }

    const results = searchDNIsByName(term);

    if (results.length === 0) {
      return message.reply('No se encontró ningún DNI con ese nombre.');
    }

    const dni = results[0];
    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle('DNI encontrado - Elite Chile RP')
      .addFields(
        { name: 'Nombre completo', value: dni.nombre },
        { name: 'Fecha de Nacimiento', value: dni.fecha_nacimiento, inline: true },
        { name: 'Sexo', value: dni.sexo, inline: true },
        { name: 'Nacionalidad', value: dni.nacionalidad, inline: true }
      );

    return message.reply({ embeds: [embed] });
  }
};