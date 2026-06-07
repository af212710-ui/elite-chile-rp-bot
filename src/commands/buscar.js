const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '..', '..', 'data', 'dnis.json');
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';

function loadDNIs() {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8') || '{}'); } catch { return {}; }
}

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = {
  name: 'buscar',
  description: 'Buscar DNI por nombre (solo staff)',
  execute: async (message, args, client) => {
    if (!hasStaffRole(message.member)) {
      return message.reply('Solo el staff puede usar este comando.');
    }

    const dnis = loadDNIs();
    const term = args.join(' ').toLowerCase();

    if (!term) {
      return message.reply('Uso: `ch!buscar Nombre`');
    }

    const found = Object.values(dnis).find(d => d.nombre.toLowerCase().includes(term));

    if (!found) {
      return message.reply('No se encontró ningún DNI con ese nombre.');
    }

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle('DNI encontrado - Elite Chile RP')
      .addFields(
        { name: 'Nombre completo', value: found.nombre },
        { name: 'Fecha de Nacimiento', value: found.fecha_nacimiento, inline: true },
        { name: 'Sexo', value: found.sexo, inline: true },
        { name: 'Nacionalidad', value: found.nacionalidad, inline: true }
      );

    return message.reply({ embeds: [embed] });
  }
};