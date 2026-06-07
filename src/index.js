require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.commands = new Collection();

// Cargar comandos automáticamente
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(path.join(commandsPath, file));
  if (command.name) {
    client.commands.set(command.name, command);
  }
}

client.once('ready', () => {
  // Inicializar base de datos SQLite
  require('./utils/database').getDB();
  console.log(`\u2705 Bot conectado como ${client.user.tag}`);
  client.user.setActivity('Elite Chile RP', { type: 3 });
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
      message.reply('Ocurri\u00f3 un error al ejecutar el comando.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);