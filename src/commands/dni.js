const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '..', '..', 'data', 'dnis.json');

function loadDNIs() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
      fs.writeFileSync(dataPath, '{}');
    }
    const data = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(data || '{}');
  } catch (error) {
    console.error('Error cargando DNIs:', error);
    return {};
  }
}

function saveDNIs(data) {
  try {
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error guardando DNIs:', error);
  }
}

module.exports = async (message, args, client) => {
  const subCommand = args[0] ? args[0].toLowerCase() : '';
  const dnis = loadDNIs();
  const authorId = message.author.id;

  // ==================== CREAR DNI ====================
  if (subCommand === 'crear' || subCommand === 'create') {
    const rest = args.slice(1).join(' ');
    if (!rest) {
      return message.reply('**Uso correcto:** `ch!dni crear Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`');
    }

    const parts = rest.split(',').map(p => p.trim());
    if (parts.length < 4) {
      return message.reply('Faltan datos. Formato: `Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`');
    }

    const [nombre, fecha, sexoRaw, nacionalidad] = parts;

    // Validar formato de fecha DD/MM/AAAA
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(fecha)) {
      return message.reply('La fecha de nacimiento debe estar en formato **DD/MM/AAAA** (ejemplo: 15/03/1995).');
    }

    // Normalizar sexo
    let sexo = sexoRaw.toLowerCase();
    if (sexo === 'm' || sexo === 'masculino') sexo = 'Masculino';
    else if (sexo === 'f' || sexo === 'femenino') sexo = 'Femenino';

    // Guardar
    dnis[authorId] = {
      nombre: nombre,
      fecha_nacimiento: fecha,
      sexo: sexo,
      nacionalidad: nacionalidad,
      creado_en: new Date().toISOString()
    };

    saveDNIs(dnis);

    return message.reply(`✅ **DNI registrado correctamente** para **${nombre}**.`);
  }

  // ==================== INFO (tu propio DNI) ====================
  if (subCommand === 'info' || subCommand === '') {
    const dni = dnis[authorId];
    if (!dni) {
      return message.reply('No tienes un DNI registrado todav\u00eda. Usa `ch!dni crear Nombre, DD/MM/AAAA, Sexo, Nacionalidad`');
    }

    const embed = new EmbedBuilder()
      .setColor('#2C3E50')
      .setTitle('DNI - Elite Chile RP')
      .addFields(
        { name: 'Nombre completo', value: dni.nombre, inline: false },
        { name: 'Fecha de Nacimiento', value: dni.fecha_nacimiento, inline: true },
        { name: 'Sexo', value: dni.sexo, inline: true },
        { name: 'Nacionalidad', value: dni.nacionalidad, inline: true }
      )
      .setFooter({ text: `Registrado el ${new Date(dni.creado_en).toLocaleDateString('es-CL')}` });

    return message.reply({ embeds: [embed] });
  }

  // ==================== BUSCAR ====================
  if (subCommand === 'buscar') {
    const mentionedUser = message.mentions.users.first();

    if (mentionedUser) {
      const dni = dnis[mentionedUser.id];
      if (!dni) {
        return message.reply('Esa persona no tiene un DNI registrado.');
      }

      const embed = new EmbedBuilder()
        .setColor('#2C3E50')
        .setTitle(`DNI de ${dni.nombre}`)
        .addFields(
          { name: 'Nombre completo', value: dni.nombre, inline: false },
          { name: 'Fecha de Nacimiento', value: dni.fecha_nacimiento, inline: true },
          { name: 'Sexo', value: dni.sexo, inline: true },
          { name: 'Nacionalidad', value: dni.nacionalidad, inline: true }
        );

      return message.reply({ embeds: [embed] });
    }

    // Buscar por nombre (si no hay menci\u00f3n)
    if (args[1]) {
      const searchTerm = args.slice(1).join(' ').toLowerCase();
      const foundEntry = Object.values(dnis).find(entry => 
        entry.nombre.toLowerCase().includes(searchTerm)
      );

      if (foundEntry) {
        const embed = new EmbedBuilder()
          .setColor('#2C3E50')
          .setTitle('DNI encontrado - Elite Chile RP')
          .addFields(
            { name: 'Nombre completo', value: foundEntry.nombre, inline: false },
            { name: 'Fecha de Nacimiento', value: foundEntry.fecha_nacimiento, inline: true },
            { name: 'Sexo', value: foundEntry.sexo, inline: true },
            { name: 'Nacionalidad', value: foundEntry.nacionalidad, inline: true }
          );
        return message.reply({ embeds: [embed] });
      } else {
        return message.reply('No se encontr\u00f3 ning\u00fan DNI con ese nombre.');
      }
    }

    return message.reply('Uso: `ch!dni buscar @usuario` o `ch!dni buscar Nombre`');
  }

  // ==================== AYUDA ====================
  return message.reply(
    '**Comandos del sistema DNI:**\n' +
    '`ch!dni crear Nombre completo, DD/MM/AAAA, Sexo, Nacionalidad`\n' +
    '`ch!dni info` - Ver tu DNI\n' +
    '`ch!dni buscar @usuario` o `ch!dni buscar Nombre`'
  );
};