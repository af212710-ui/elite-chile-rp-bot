const { getDNI, deleteDNI } = require('../utils/database');
const redis = require('../utils/redis');
const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';
const CIVIL_ROLE_ID = process.env.CIVIL_ROLE_ID;

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = {
  name: 'eliminardni',
  description: 'Eliminar DNI de un usuario (solo staff)',
  execute: async (message, args, client) => {
    if (!hasStaffRole(message.member)) {
      return message.reply('Solo el staff puede eliminar DNIs.');
    }

    const mentioned = message.mentions.users.first();
    if (!mentioned) {
      return message.reply('Uso: `ch!eliminardni @usuario`');
    }

    const dni = getDNI(mentioned.id);
    if (!dni) {
      return message.reply('Esa persona no tiene DNI registrado.');
    }

    if (CIVIL_ROLE_ID) {
      try {
        const targetMember = await message.guild.members.fetch(mentioned.id);
        if (targetMember.roles.cache.has(CIVIL_ROLE_ID)) {
          await targetMember.roles.remove(CIVIL_ROLE_ID);
        }
      } catch(e){}
    }

    deleteDNI(mentioned.id);

    // Eliminar del caché de Redis
    await redis.del(`dni:${mentioned.id}`);

    return message.reply(`✅ DNI de **${mentioned.username}** eliminado correctamente.`);
  }
};