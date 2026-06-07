const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '..', '..', 'data', 'dnis.json');
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';
const CIVIL_ROLE_ID = process.env.CIVIL_ROLE_ID;

function loadDNIs() {
  try { return JSON.parse(fs.readFileSync(dataPath, 'utf8') || '{}'); } catch { return {}; }
}

function saveDNIs(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = async (message, args, client) => {
  if (!hasStaffRole(message.member)) {
    return message.reply('Solo el staff puede eliminar DNIs.');
  }

  const mentioned = message.mentions.users.first();
  if (!mentioned) {
    return message.reply('Uso: `ch!eliminardni @usuario`');
  }

  const dnis = loadDNIs();
  if (!dnis[mentioned.id]) {
    return message.reply('Esa persona no tiene DNI registrado.');
  }

  // Eliminar rol Civil si existe
  if (CIVIL_ROLE_ID) {
    try {
      const targetMember = await message.guild.members.fetch(mentioned.id);
      if (targetMember.roles.cache.has(CIVIL_ROLE_ID)) {
        await targetMember.roles.remove(CIVIL_ROLE_ID);
      }
    } catch(e){}
  }

  delete dnis[mentioned.id];
  saveDNIs(dnis);

  return message.reply(`✅ DNI de **${mentioned.username}** eliminado correctamente.`);
};