require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const fs = require('fs');
const path = require('path');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

const commandsPath = path.join(__dirname, 'commands');

client.once('ready', () => {
  console.log(`\u2705 Bot conectado como ${client.user.tag}`);
  client.user.setActivity('Elite Chile RP', { type: 3 });
});

// Comando prefix ch!
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith('ch!')) return;

  const args = message.content.slice(2).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  if (commandName === 'dni') {
    try {
      const dniCommand = require('./commands/dni');
      await dniCommand(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('Ocurri\u00f3 un error al ejecutar el comando DNI.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);