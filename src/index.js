require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages
  ]
});

client.once('ready', () => {
  console.log(`Bot conectado como ${client.user.tag}`);
  
  // Actividad limpia y profesional
  client.user.setActivity('Elite Chile RP', { type: 3 });
});

client.login(process.env.DISCORD_TOKEN);