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
  name: 'verdni',
  description: 'Ver DNI propio o de otra persona (staff)',
  execute: async (message, args, client) => {
    const dnis = loadDNIs();
    const mentioned = message.mentions.users.first();
    const isStaff = hasStaffRole(message.member);

    let targetId = message.author.id;
    let title = 'Tu DNI - Elite Chile RP';

    if (mentioned) {
      if (!isStaff) {
        return message.reply('Solo el staff puede ver el DNI de otras personas.');
      }
      targetId = mentioned.id;
      title = `DNI de ${mentioned.username}`;
    }

    const dni = dnis[targetId];
    if (!dni) {
      return message.reply(mentioned ? 'Esa persona no tiene DNI registrado.' : 'No tienes DNI registrado. Usa `ch!creadni`.');
    }

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle(title)
      .addFields(
        { name: 'Nombre completo', value: dni.nombre },
        { name: 'Fecha de Nacimiento', value: dni.fecha_nacimiento, inline: true },
        { name: 'Sexo', value: dni.sexo, inline: true },
        { name: 'Nacionalidad', value: dni.nacionalidad, inline: true }
      );

    return message.reply({ embeds: [embed] });
  }
};