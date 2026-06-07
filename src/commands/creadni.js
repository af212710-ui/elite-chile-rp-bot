const { createOrUpdateDNI } = require('../utils/database');
const redis = require('../utils/redis');
const CIVIL_ROLE_ID = process.env.CIVIL_ROLE_ID;

function isValidRealDate(dateStr) {
  const [d, m, y] = dateStr.split('/').map(Number);
  if (!d || !m || !y) return false;
  const date = new Date(y, m - 1, d);
  return date.getFullYear() === y && date.getMonth() === m - 1 && date.getDate() === d && y >= 1900 && y <= new Date().getFullYear();
}

module.exports = {
  name: 'creadni',
  description: 'Crear un nuevo DNI',
  execute: async (message, args, client) => {
    const rest = args.join(' ');
    if (!rest) {
      return message.reply('**Uso:** `ch!creadni Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`');
    }

    const parts = rest.split(',').map(p => p.trim());
    if (parts.length < 4) {
      return message.reply('Formato: `ch!creadni Jesus Matias Luz Martinez, 15/03/1995, Masculino, Chilena`');
    }

    const [nombre, fecha, sexoRaw, nacionalidad] = parts;

    if (!isValidRealDate(fecha)) {
      return message.reply('Fecha inválida. Debe ser una fecha real en formato **DD/MM/AAAA** y no futura.');
    }

    let sexo = sexoRaw.toLowerCase();
    if (sexo === 'm' || sexo === 'masculino') sexo = 'Masculino';
    else if (sexo === 'f' || sexo === 'femenino') sexo = 'Femenino';

    createOrUpdateDNI(message.author.id, {
      nombre,
      fecha_nacimiento: fecha,
      sexo,
      nacionalidad
    });

    // Invalidar caché anterior si existe
    await redis.del(`dni:${message.author.id}`);

    if (CIVIL_ROLE_ID) {
      try { await message.member.roles.add(CIVIL_ROLE_ID); } catch (e) {}
    }

    return message.reply(`✅ **DNI creado correctamente** para **${nombre}**.`);
  }
};