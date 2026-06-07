require('dotenv').config();
const { 
  Client, 
  GatewayIntentBits, 
  EmbedBuilder, 
  SlashCommandBuilder 
} = require('discord.js');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
  ]
});

client.once('ready', async () => {
  console.log(`✅ Bot listo como ${client.user.tag}`);
  
  // Registrar comandos slash (global)
  const commands = [
    new SlashCommandBuilder()
      .setName('ping')
      .setDescription('Muestra la latencia del bot'),
    
    new SlashCommandBuilder()
      .setName('reglas')
      .setDescription('Muestra las reglas principales de Elite Chile RP'),
    
    new SlashCommandBuilder()
      .setName('info')
      .setDescription('Información sobre la comunidad Elite Chile Roleplay'),
  ];

  try {
    await client.application.commands.set(commands);
    console.log('✅ Comandos slash registrados globalmente (puede tardar unos minutos en aparecer)');
  } catch (error) {
    console.error('Error registrando comandos:', error);
  }

  // Estado del bot
  client.user.setActivity('Elite Chile RP 🔥', { type: 3 });
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === 'ping') {
    const sent = await interaction.reply({ content: 'Calculando latencia...', fetchReply: true });
    const latency = sent.createdTimestamp - interaction.createdTimestamp;
    await interaction.editReply(`🏓 Pong! Latencia: ${latency}ms | API: ${client.ws.ping}ms`);
  }

  if (commandName === 'reglas') {
    const embed = new EmbedBuilder()
      .setColor('#FF0000')
      .setTitle('📜 Reglas de Elite Chile RP')
      .setDescription('Respeta estas reglas para mantener la mejor experiencia de roleplay en el servidor.')
      .addFields(
        { name: '1. Roleplay de calidad', value: 'Siempre en personaje (IC). Nada de hablar OOC en voz o chat IC.' },
        { name: '2. Respeto total', value: 'Respeta a todos los jugadores y al staff. Cero toxicidad.' },
        { name: '3. No RDM / VDM', value: 'No mates ni atropelles sin una razón válida de roleplay.' },
        { name: '4. No meta-gaming', value: 'No uses información que tu personaje no debería saber.' },
        { name: '5. Cumple las leyes', value: 'Sigue las leyes de la ciudad y las normas de tu facción.' },
      )
      .setFooter({ text: 'Elite Chile RP • El mejor roleplay de Chile' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'info') {
    const embed = new EmbedBuilder()
      .setColor('#00AA00')
      .setTitle('🇨🇱 Elite Chile Roleplay')
      .setDescription('El servidor de GTA V FiveM Roleplay más completo, moderno y activo de Chile.')
      .addFields(
        { name: '🌟 ¿Qué te espera?', value: '• Scripts modernos y muy optimizados\n• Gran variedad de vehículos custom y tuneables\n• Roles delictuales y legales de alta calidad\n• Staff activo, justo y rápido\n• Comunidad unida y divertida' },
        { name: '🔗 Cómo unirte', value: 'Entra al Discord oficial de la comunidad y comienza tu historia hoy.' },
        { name: '📍 IP del servidor', value: 'La IP oficial se encuentra en el Discord de Elite Chile RP' },
      )
      .setFooter({ text: '¡Bienvenido a la élite del roleplay chileno!' })
      .setTimestamp();

    await interaction.reply({ embeds: [embed] });
  }
});

client.login(process.env.DISCORD_TOKEN);