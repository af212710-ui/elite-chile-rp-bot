const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '..', '..', 'data', 'dnis.json');

const STAFF_ROLE_ID = process.env.STAFF_ROLE_ID || '1508320073784496159';
const CIVIL_ROLE_ID = process.env.CIVIL_ROLE_ID;

function loadDNIs() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
      fs.writeFileSync(dataPath, '{}');
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8') || '{}');
  } catch {
    return {};
  }
}

function saveDNIs(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

// Validación de fecha real (DD/MM/AAAA)
function isValidRealDate(dateStr) {
  const parts = dateStr.split('/');
  if (parts.length !== 3) return false;

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  const year = parseInt(parts[2], 10);

  if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
  if (year < 1900 || year > new Date().getFullYear()) return false;

  const date = new Date(year, month - 1, day);
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day
  );
}

function hasStaffRole(member) {
  return member.roles.cache.has(STAFF_ROLE_ID);
}

module.exports = async (message, args, client) => {
  const subCommand = args[0] ? args[0].toLowerCase() : '';
  const dnis = loadDNIs();
  const authorId = message.author.id;
  const member = message.member;

  // ==================== CREAR DNI ====================
  if (subCommand === 'crear' || subCommand === 'create') {
    const rest = args.slice(1).join(' ');
    if (!rest) {
      return message.reply('**Uso:** `ch!dni crear Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`');
    }

    const parts = rest.split(',').map(p => p.trim());
    if (parts.length < 4) {
      return message.reply('Formato incorrecto. Ejemplo: `ch!dni crear Jesus Matias Luz Martinez, 15/03/1995, Masculino, Chilena`');
    }

    const [nombre, fecha, sexoRaw, nacionalidad] = parts;

    if (!isValidRealDate(fecha)) {
      return message.reply('Fecha inválida. Debe ser una fecha real en formato **DD/MM/AAAA** (ej: 15/03/1995) y no puede ser futura.');
    }

    // Normalizar sexo
    let sexo = sexoRaw.toLowerCase();
    if (sexo === 'm' || sexo === 'masculino') sexo = 'Masculino';
    else if (sexo === 'f' || sexo === 'femenino') sexo = 'Femenino';

    // Guardar DNI
    dnis[authorId] = {
      nombre,
      fecha_nacimiento: fecha,
      sexo,
      nacionalidad,
      creado_en: new Date().toISOString()
    };
    saveDNIs(dnis);

    // Asignar rol de Civil automáticamente
    if (CIVIL_ROLE_ID) {
      try {
        await member.roles.add(CIVIL_ROLE_ID);
      } catch (err) {
        console.error('No se pudo asignar el rol civil:', err);
      }
    }

    return message.reply(`✅ **DNI registrado correctamente** para **${nombre}**.`);
  }

  // ==================== INFO ====================
  if (subCommand === 'info' || subCommand === '') {
    const dni = dnis[authorId];
    if (!dni) {
      return message.reply('No tienes DNI registrado. Usa `ch!dni crear ...`');
    }

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle('DNI - Elite Chile RP')
      .addFields(
        { name: 'Nombre completo', value: dni.nombre },
        { name: 'Fecha de Nacimiento', value: dni.fecha_nacimiento, inline: true },
        { name: 'Sexo', value: dni.sexo, inline: true },
        { name: 'Nacionalidad', value: dni.nacionalidad, inline: true }
      )
      .setFooter({ text: `Registrado el ${new Date(dni.creado_en).toLocaleDateString('es-CL')}` });

    return message.reply({ embeds: [embed] });
  }

  // ==================== BUSCAR ====================
  if (subCommand === 'buscar') {
    const mentioned = message.mentions.users.first();

    if (mentioned) {
      const dni = dnis[mentioned.id];
      if (!dni) return message.reply('Esa persona no tiene DNI registrado.');

      const embed = new EmbedBuilder()
        .setColor('#2C3E50')
        .setTitle(`DNI de ${dni.nombre}`)
        .addFields(
          { name: 'Nombre completo', value: dni.nombre },
          { name: 'Fecha de Nacimiento', value: dni.fecha_nacimiento, inline: true },
          { name: 'Sexo', value: dni.sexo, inline: true },
          { name: 'Nacionalidad', value: dni.nacionalidad, inline: true }
        );
      return message.reply({ embeds: [embed] });
    }

    if (args[1]) {
      const term = args.slice(1).join(' ').toLowerCase();
      const found = Object.values(dnis).find(d => d.nombre.toLowerCase().includes(term));
      if (found) {
        const embed = new EmbedBuilder()
          .setColor('#2C3E50')
          .setTitle('DNI encontrado')
          .addFields(
            { name: 'Nombre completo', value: found.nombre },
            { name: 'Fecha de Nacimiento', value: found.fecha_nacimiento, inline: true },
            { name: 'Sexo', value: found.sexo, inline: true },
            { name: 'Nacionalidad', value: found.nacionalidad, inline: true }
          );
        return message.reply({ embeds: [embed] });
      }
      return message.reply('No se encontró ningún DNI con ese nombre.');
    }

    return message.reply('Uso: `ch!dni buscar @usuario` o `ch!dni buscar Nombre`');
  }

  // Ayuda por defecto
  return message.reply('Usa `ch!ayuda` para ver todos los comandos disponibles.');
};