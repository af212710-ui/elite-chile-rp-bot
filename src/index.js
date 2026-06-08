require('dotenv').config();
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

const { canCollect, getLastCollect, updateLastSalaryReminder, getLastSalaryReminder } = require('./utils/database');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.DirectMessages
  ]
});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name) {
    client.commands.set(command.name, command);
  }
}

client.once('ready', () => {
  require('./utils/database').getDB();
  require('./utils/redis');
  console.log(`\u2705 Bot conectado como ${client.user.tag}`);
  client.user.setActivity('Elite Chile RP', { type: 3 });

  // Recordatorios automáticos de sueldo semanal (cada 6 horas)
  setInterval(async () => {
    try {
      const now = Date.now();
      const weekInMs = 7 * 24 * 60 * 60 * 1000;

      // Esto es simplificado. En producción idealmente se consultaría solo usuarios que pueden cobrar.
      // Por ahora enviamos recordatorio si pasaron 7 días desde last_collect y no se ha recordado recientemente.
      console.log('Verificando recordatorios de sueldo...');

      // Nota: Para una implementación completa se necesitaría una forma de listar usuarios.
      // Esta versión envía recordatorio cuando el usuario interactúa con el bot.
    } catch (error) {
      console.error('Error en recordatorios automáticos:', error);
    }
  }, 6 * 60 * 60 * 1000); // Cada 6 horas
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith('ch!')) return;

  const args = message.content.slice(2).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (command) {
    try {
      await command.execute(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('Ocurrió un error al ejecutar el comando.');
    }
  }
});

// Función para enviar recordatorio por DM
async function sendSalaryReminder(userId, client) {
  try {
    const user = await client.users.fetch(userId);
    if (!user) return;

    const embed = new EmbedBuilder()
      .setColor('#27AE60')
      .setTitle('💰 ¡Tu sueldo semanal está disponible!')
      .setDescription('Ya puedes reclamar tu sueldo semanal usando `ch!collect` en el servidor.')
      .setFooter({ text: 'Elite Chile RP' });

    await user.send({ embeds: [embed] });
  } catch (error) {
    console.error(`No se pudo enviar DM a ${userId}:`, error.message);
  }
}

client.login(process.env.DISCORD_TOKEN);