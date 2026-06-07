const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

const dataPath = path.join(__dirname, '..', '..', 'data', 'dnis.json');
const CIVIL_ROLE_ID = process.env.CIVIL_ROLE_ID;

function loadDNIs() {
  try {
    if (!fs.existsSync(dataPath)) {
      fs.mkdirSync(path.dirname(dataPath), { recursive: true });
      fs.writeFileSync(dataPath, '{}');
    }
    return JSON.parse(fs.readFileSync(dataPath, 'utf8') || '{}');
  } catch { return {}; }
}

function saveDNIs(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

function isValidRealDate(dateStr) {
  const [d, m, y] = dateStr.split('/').map(Number);
  if (!d || !m || !y) return false;
  const date = new Date(y, m-1, d);
  return date.getFullYear() === y && date.getMonth() === m-1 && date.getDate() === d && y >= 1900 && y <= new Date().getFullYear();
}

module.exports = async (message, args, client) => {
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
    return message.reply('Fecha inválida. Usa formato **DD/MM/AAAA** y una fecha real (no futura).');
  }

  let sexo = sexoRaw.toLowerCase();
  if (sexo === 'm' || sexo === 'masculino') sexo = 'Masculino';
  else if (sexo === 'f' || sexo === 'femenino') sexo = 'Femenino';

  const dnis = loadDNIs();
  dnis[message.author.id] = {
    nombre, fecha_nacimiento: fecha, sexo, nacionalidad, creado_en: new Date().toISOString()
  };
  saveDNIs(dnis);

  // Asignar rol Civil
  if (CIVIL_ROLE_ID) {
    try { await message.member.roles.add(CIVIL_ROLE_ID); } catch(e){}
  }

  return message.reply(`✅ **DNI creado correctamente** para **${nombre}**.`);
};