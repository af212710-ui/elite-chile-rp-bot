const { getTopUsers } = require('../utils/database');
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const USERS_PER_PAGE = 10;

module.exports = {
  name: 'leaderboard',
  description: 'Muestra el top de usuarios más ricos con paginación',
  execute: async (message, args, client) => {
    const allUsers = getTopUsers(1000); // Traemos hasta 1000 usuarios
    if (allUsers.length === 0) {
      return message.reply('Aún no hay datos de economía.');
    }

    let currentPage = 1;
    const totalPages = Math.ceil(allUsers.length / USERS_PER_PAGE);

    const generateEmbed = async (page) => {
      const start = (page - 1) * USERS_PER_PAGE;
      const end = start + USERS_PER_PAGE;
      const pageUsers = allUsers.slice(start, end);

      let description = '';

      for (let i = 0; i < pageUsers.length; i++) {
        const user = pageUsers[i];
        const position = start + i + 1;

        let userTag = `Usuario ${user.user_id}`;
        try {
          const fetchedUser = await client.users.fetch(user.user_id);
          userTag = fetchedUser.username;
        } catch (e) {}

        const medal = position === 1 ? '🥇' : 
                      position === 2 ? '🥈' : 
                      position === 3 ? '🥉' : `🔹`;

        description += `${medal} **${position}.** ${userTag} - **$${user.total.toLocaleString()}**
`;
      }

      return new EmbedBuilder()
        .setColor('#F1C40F')
        .setTitle('🏆 Leaderboard - Elite Chile RP')
        .setDescription(description || 'No hay usuarios en esta página.')
        .setFooter({ text: `Página ${page} de ${totalPages} • Total: ${allUsers.length} usuarios` });
    };

    const embed = await generateEmbed(currentPage);

    const row = new ActionRowBuilder().addComponents(
      new ButtonBuilder()
        .setCustomId('prev')
        .setLabel('⬅️ Anterior')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === 1),
      new ButtonBuilder()
        .setCustomId('next')
        .setLabel('Siguiente ➡️')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(currentPage === totalPages)
    );

    const reply = await message.reply({ embeds: [embed], components: [row] });

    const collector = reply.createMessageComponentCollector({
      filter: i => i.user.id === message.author.id,
      time: 120000 // 2 minutos
    });

    collector.on('collect', async i => {
      if (i.customId === 'prev' && currentPage > 1) currentPage--;
      if (i.customId === 'next' && currentPage < totalPages) currentPage++;

      const newEmbed = await generateEmbed(currentPage);

      const newRow = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
          .setCustomId('prev')
          .setLabel('⬅️ Anterior')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === 1),
        new ButtonBuilder()
          .setCustomId('next')
          .setLabel('Siguiente ➡️')
          .setStyle(ButtonStyle.Secondary)
          .setDisabled(currentPage === totalPages)
      );

      await i.update({ embeds: [newEmbed], components: [newRow] });
    });

    collector.on('end', () => {
      reply.edit({ components: [] }).catch(() => {});
    });
  }
};