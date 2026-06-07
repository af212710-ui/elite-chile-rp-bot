require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

client.once('ready', () => {
  console.log(`\u2705 Bot conectado como ${client.user.tag}`);
  client.user.setActivity('Elite Chile RP', { type: 3 });
});

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;
  if (!message.content.startsWith('ch!')) return;

  const args = message.content.slice(2).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Nuevos comandos DNI
  const dniCommands = {
    'creadni': './commands/creadni',
    'verdni': './commands/verdni',
    'buscar': './commands/buscar',
    'eliminardni': './commands/eliminardni'
  };

  if (dniCommands[commandName]) {
    try {
      const cmd = require(dniCommands[commandName]);
      await cmd(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('Ocurri\u00f3 un error al ejecutar el comando.');
    }
  }

  if (commandName === 'ayuda') {
    try {
      const ayudaCommand = require('./commands/ayuda');
      await ayudaCommand(message, args, client);
    } catch (error) {
      console.error(error);
      message.reply('Ocurri\u00f3 un error.');
    }
  }
});

client.login(process.env.DISCORD_TOKEN);